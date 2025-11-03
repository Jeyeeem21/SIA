<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // Get all product IDs
        $productIds = DB::table('products')->pluck('product_id');
        
        $inventories = [];
        foreach ($productIds as $productId) {
            $inventories[] = [
                'product_id' => $productId,
                'quantity' => 100,
                'reorder_level' => 10,
                'reorder_quantity' => 50,
                'last_restock_date' => $now->format('Y-m-d'),
                'last_restock_quantity' => 100,
            ];
        }

        DB::table('inventories')->insert($inventories);
    }
}
