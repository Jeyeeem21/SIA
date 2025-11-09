<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Backfill product transactions from existing order_items
        $orderItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->join('inventories', 'order_items.product_id', '=', 'inventories.product_id')
            ->select(
                'order_items.*',
                'orders.order_number',
                'orders.created_at as order_date',
                'inventories.quantity as current_quantity'
            )
            ->orderBy('order_items.created_at')
            ->get();

        foreach ($orderItems as $item) {
            // Calculate previous quantity (current + quantity sold)
            $previousQuantity = $item->current_quantity + $item->quantity;
            
            DB::table('product_transactions')->insert([
                'product_id' => $item->product_id,
                'transaction_type' => 'out',
                'quantity' => $item->quantity,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $item->current_quantity,
                'reference_type' => 'order',
                'reference_id' => $item->order_id,
                'notes' => "Order #{$item->order_number} - Backfilled transaction",
                'performed_by' => null,
                'created_at' => $item->created_at,
                'updated_at' => $item->created_at,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('product_transactions')
            ->where('notes', 'like', '%Backfilled transaction%')
            ->delete();
    }
};
