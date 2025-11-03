<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with('category', 'inventory');
        
        // Search by barcode
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('barcode', $search);
        }
        
        $products = $query->orderBy('created_at', 'desc')->get();
        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:100|unique:products',
            'barcode' => 'required|string|max:50|unique:products',
            'category_id' => 'required|exists:categories,category_id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'required|string|max:20',
            'image_url' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        $product = Product::create($validated);
        
        // Automatically create inventory record for the new product
        $product->inventory()->create([
            'quantity' => 0,
            'reorder_level' => 20,
            'reorder_quantity' => 50,
        ]);
        
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
            'status' => 'nullable|in:active,inactive',
        ]);

        $product->update($validated);
        return response()->json($product->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
