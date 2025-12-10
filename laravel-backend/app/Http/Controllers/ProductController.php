<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\CacheService;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     * Optimized with eager loading, indexes, and 1-second cache
     */
    public function index(Request $request)
    {
        // Cache key based on search parameter
        $cacheKey = 'products_' . ($request->has('search') ? md5($request->input('search')) : 'all');
        
        return Cache::remember($cacheKey, 1, function () use ($request) {
            $query = Product::with('category', 'inventory');
            
            // Search by barcode
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where('barcode', $search);
            }
            
            $products = $query->orderBy('created_at', 'desc')->get();
            return response()->json($products);
        });
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:100|unique:products,product_name',
            'barcode' => 'required|string|max:50|unique:products,barcode',
            'category_id' => 'required|exists:categories,category_id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'required|string|max:20',
            'image_url' => 'nullable|string',
            'product_image' => 'nullable|string',
            'expiration_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Default status to 'active' if not provided
        $validated['status'] = $validated['status'] ?? 'active';

        $product = Product::create($validated);
        
        // Automatically create inventory record for the new product
        $product->inventory()->create([
            'quantity' => 0,
            'reorder_level' => 20,
            'reorder_quantity' => 50,
        ]);

        // Auto-set is_active: true if (not expired OR no expiry) AND has stock, else false
        $isNotExpired = true;
        if ($product->expiration_date) {
            $isNotExpired = \Carbon\Carbon::parse($product->expiration_date)->isFuture();
        }
        $hasStock = $product->inventory->quantity > 0;
        $product->is_active = $isNotExpired && $hasStock;
        $product->save();
        
        CacheService::clearProductCache();
        
        return response()->json($product->load('category', 'inventory'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:100|unique:products,product_name,' . $product->product_id . ',product_id',
            'barcode' => 'required|string|max:50|unique:products,barcode,' . $product->product_id . ',product_id',
            'category_id' => 'required|exists:categories,category_id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'required|string|max:20',
            'image_url' => 'nullable|string',
            'product_image' => 'nullable|string',
            'expiration_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive',
        ]);

        $product->update($validated);
        $product->refresh()->load('inventory');

        // Auto-set is_active: true if (not expired OR no expiry) AND has stock, else false
        $isNotExpired = true;
        if ($product->expiration_date) {
            $isNotExpired = \Carbon\Carbon::parse($product->expiration_date)->isFuture();
        }
        $hasStock = $product->inventory->quantity > 0;
        $product->is_active = $isNotExpired && $hasStock;
        $product->save();
        
        CacheService::clearProductCache();
        
        return response()->json($product->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     * Deletes the product but keeps all historical records (orders, transactions, sales)
     */
    public function destroy(Product $product)
    {
        // Delete the product - historical records in order_items will remain intact
        // due to foreign key constraint using SET NULL or CASCADE behavior
        $product->delete();
        
        CacheService::clearProductCache();
        
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
