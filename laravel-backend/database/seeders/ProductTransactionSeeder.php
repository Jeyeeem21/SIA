<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $transactions = [];
        
        // Get some product IDs (first 10 products)
        $productIds = range(1, 10);
        
        // July 2025 transactions
        foreach ($productIds as $productId) {
            // IN transactions (restock)
            $transactions[] = [
                'product_id' => $productId,
                'type' => 'IN',
                'quantity' => rand(50, 150),
                'unit_price' => rand(100, 500),
                'total_amount' => 0, // Will be calculated
                'reference_type' => 'Purchase Order',
                'reference_id' => null,
                'notes' => 'July restock',
                'user_id' => 1,
                'created_at' => Carbon::create(2025, 7, rand(1, 30)),
                'updated_at' => Carbon::create(2025, 7, rand(1, 30)),
            ];
            
            // OUT transactions (sales)
            for ($i = 0; $i < rand(3, 8); $i++) {
                $qty = rand(1, 10);
                $price = rand(100, 500);
                $transactions[] = [
                    'product_id' => $productId,
                    'type' => 'OUT',
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'total_amount' => $qty * $price,
                    'reference_type' => 'Order',
                    'reference_id' => null,
                    'notes' => 'July sales',
                    'user_id' => 1,
                    'created_at' => Carbon::create(2025, 7, rand(1, 30), rand(8, 18), rand(0, 59)),
                    'updated_at' => Carbon::create(2025, 7, rand(1, 30), rand(8, 18), rand(0, 59)),
                ];
            }
        }
        
        // August 2025 transactions
        foreach ($productIds as $productId) {
            // IN transactions
            $transactions[] = [
                'product_id' => $productId,
                'type' => 'IN',
                'quantity' => rand(60, 180),
                'unit_price' => rand(100, 500),
                'total_amount' => 0,
                'reference_type' => 'Purchase Order',
                'reference_id' => null,
                'notes' => 'August restock',
                'user_id' => 1,
                'created_at' => Carbon::create(2025, 8, rand(1, 31)),
                'updated_at' => Carbon::create(2025, 8, rand(1, 31)),
            ];
            
            // OUT transactions
            for ($i = 0; $i < rand(5, 12); $i++) {
                $qty = rand(1, 15);
                $price = rand(100, 500);
                $transactions[] = [
                    'product_id' => $productId,
                    'type' => 'OUT',
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'total_amount' => $qty * $price,
                    'reference_type' => 'Order',
                    'reference_id' => null,
                    'notes' => 'August sales',
                    'user_id' => 1,
                    'created_at' => Carbon::create(2025, 8, rand(1, 31), rand(8, 18), rand(0, 59)),
                    'updated_at' => Carbon::create(2025, 8, rand(1, 31), rand(8, 18), rand(0, 59)),
                ];
            }
        }
        
        // October 2025 transactions
        foreach ($productIds as $productId) {
            // IN transactions
            $transactions[] = [
                'product_id' => $productId,
                'type' => 'IN',
                'quantity' => rand(40, 120),
                'unit_price' => rand(100, 500),
                'total_amount' => 0,
                'reference_type' => 'Purchase Order',
                'reference_id' => null,
                'notes' => 'October restock',
                'user_id' => 1,
                'created_at' => Carbon::create(2025, 10, rand(1, 31)),
                'updated_at' => Carbon::create(2025, 10, rand(1, 31)),
            ];
            
            // OUT transactions
            for ($i = 0; $i < rand(8, 15); $i++) {
                $qty = rand(2, 20);
                $price = rand(100, 500);
                $transactions[] = [
                    'product_id' => $productId,
                    'type' => 'OUT',
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'total_amount' => $qty * $price,
                    'reference_type' => 'Order',
                    'reference_id' => null,
                    'notes' => 'October sales',
                    'user_id' => 1,
                    'created_at' => Carbon::create(2025, 10, rand(1, 31), rand(8, 18), rand(0, 59)),
                    'updated_at' => Carbon::create(2025, 10, rand(1, 31), rand(8, 18), rand(0, 59)),
                ];
            }
        }
        
        // Calculate total_amount for IN transactions
        foreach ($transactions as &$transaction) {
            if ($transaction['type'] === 'IN') {
                $transaction['total_amount'] = $transaction['quantity'] * $transaction['unit_price'];
            }
        }
        
        // Insert all transactions
        DB::table('product_transactions')->insert($transactions);
        
        $this->command->info('Product transactions seeded successfully! Added ' . count($transactions) . ' transactions.');
    }
}
