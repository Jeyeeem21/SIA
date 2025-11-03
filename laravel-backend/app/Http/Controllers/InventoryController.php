<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inventories = Inventory::with('product.category')
            ->orderBy('updated_at', 'desc')
            ->get();
        
        return response()->json($inventories);
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

        $inventory->quantity += $validated['quantity'];
        $inventory->last_restock_date = Carbon::now()->format('Y-m-d');
        $inventory->last_restock_quantity = $validated['quantity'];
        $inventory->save();

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
