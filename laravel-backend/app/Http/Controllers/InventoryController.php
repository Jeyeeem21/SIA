<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource - OPTIMIZED with 1-second cache
     */
    public function index()
    {
        return Cache::remember('inventories_all', 1, function () {
            $inventories = Inventory::select('inventory_id', 'product_id', 'quantity', 'reorder_level', 'reorder_quantity', 'last_restock_date', 'updated_at')
                ->with([
                    'product:product_id,product_name,price,status,category_id',
                    'product.category:category_id,category_name'
                ])
                ->orderBy('updated_at', 'desc')
                ->get();
            
            return response()->json($inventories);
        });
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,product_id|unique:inventories,product_id',
            'quantity' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:1',
            'last_restock_date' => 'nullable|date',
            'last_restock_quantity' => 'nullable|integer|min:0',
        ]);

        $inventory = Inventory::create($validated);
        return response()->json($inventory->load('product.category'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        return response()->json($inventory->load('product.category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:1',
            'last_restock_date' => 'nullable|date',
            'last_restock_quantity' => 'nullable|integer|min:0',
        ]);

        $inventory->update($validated);
        return response()->json($inventory->load('product.category'));
    }

    /**
     * Restock inventory - add quantity to existing stock
     */
    public function restock(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Get product price for transaction
        $product = $inventory->product;
        $unitPrice = $product->price ?? 0;

        $inventory->quantity += $validated['quantity'];
        $inventory->last_restock_date = Carbon::now()->format('Y-m-d');
        $inventory->last_restock_quantity = $validated['quantity'];
        $inventory->save();

        // Create product transaction for IN movement
        ProductTransaction::create([
            'product_id' => $inventory->product_id,
            'type' => 'IN',
            'quantity' => $validated['quantity'],
            'unit_price' => $unitPrice,
            'total_amount' => $validated['quantity'] * $unitPrice,
            'reference_type' => 'restock',
            'reference_id' => $inventory->inventory_id,
            'user_id' => Auth::id(),
            'notes' => 'Restock - Added ' . $validated['quantity'] . ' units',
        ]);

        // Clear dashboard cache when inventory is restocked
        Cache::forget('dashboard_data');

        return response()->json([
            'message' => 'Inventory restocked successfully',
            'inventory' => $inventory->load('product.category')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        $inventory->delete();
        return response()->json(['message' => 'Inventory deleted successfully']);
    }
}
