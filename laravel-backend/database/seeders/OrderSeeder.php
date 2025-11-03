<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // Sample orders with different statuses and dates
        $orders = [
            // Completed Orders (with payments)
            [
                'order_number' => 'ORD-2025-0001',
                'customer_name' => 'Juan Dela Cruz',
                'service_type' => 'Printing',
                'total_amount' => 950.00,
                'status' => 'Completed',
                'notes' => 'Rush order - documents for school requirements',
                'preferred_pickup_date' => $now->copy()->subDays(5)->format('Y-m-d'),
                'completed_date' => $now->copy()->subDays(3),
                'created_at' => $now->copy()->subDays(7),
                'updated_at' => $now->copy()->subDays(3),
                'items' => [
                    ['product_id' => 1, 'quantity' => 2, 'unit_price' => 250.00],
                    ['product_id' => 2, 'quantity' => 1, 'unit_price' => 350.00],
                    ['product_id' => 15, 'quantity' => 1, 'unit_price' => 100.00],
                ],
                'payment' => [
                    'payment_method' => 'Cash',
                    'amount' => 1000.00,
                    'reference_number' => null,
                    'notes' => 'Change: 50 pesos',
                ],
            ],
            [
                'order_number' => 'ORD-2025-0002',
                'customer_name' => 'Maria Santos',
                'service_type' => 'ID Creation',
                'total_amount' => 630.00,
                'status' => 'Completed',
                'notes' => 'School ID renewal - 50 students',
                'preferred_pickup_date' => $now->copy()->subDays(4)->format('Y-m-d'),
                'completed_date' => $now->copy()->subDays(2),
                'created_at' => $now->copy()->subDays(6),
                'updated_at' => $now->copy()->subDays(2),
                'items' => [
                    ['product_id' => 6, 'quantity' => 1, 'unit_price' => 380.00],
                    ['product_id' => 7, 'quantity' => 10, 'unit_price' => 25.00],
                ],
                'payment' => [
                    'payment_method' => 'GCash',
                    'amount' => 630.00,
                    'reference_number' => 'GCASH123456789',
                    'notes' => 'Paid via GCash',
                ],
            ],
            [
                'order_number' => 'ORD-2025-0003',
                'customer_name' => 'Ana Reyes',
                'service_type' => 'Uniform',
                'total_amount' => 1815.00,
                'status' => 'Completed',
                'notes' => 'PE uniform for Grade 10 - 3 sets',
                'preferred_pickup_date' => $now->copy()->subDays(3)->format('Y-m-d'),
                'completed_date' => $now->copy()->subDays(1),
                'created_at' => $now->copy()->subDays(5),
                'updated_at' => $now->copy()->subDays(1),
                'items' => [
                    ['product_id' => 13, 'quantity' => 12, 'unit_price' => 150.00],
                    ['product_id' => 25, 'quantity' => 3, 'unit_price' => 35.00],
                ],
                'payment' => [
                    'payment_method' => 'Cash',
                    'amount' => 2000.00,
                    'reference_number' => null,
                    'notes' => 'Change: 185 pesos',
                ],
            ],
            
            // In Progress Orders
            [
                'order_number' => 'ORD-2025-0004',
                'customer_name' => 'Pedro Garcia',
                'service_type' => 'Lamination',
                'total_amount' => 680.00,
                'status' => 'In Progress',
                'notes' => 'Laminate certificates',
                'preferred_pickup_date' => $now->copy()->addDays(1)->format('Y-m-d'),
                'completed_date' => null,
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subHours(5),
                'items' => [
                    ['product_id' => 15, 'quantity' => 2, 'unit_price' => 280.00],
                    ['product_id' => 17, 'quantity' => 1, 'unit_price' => 120.00],
                ],
            ],
            [
                'order_number' => 'ORD-2025-0005',
                'customer_name' => 'Sofia Martinez',
                'service_type' => 'Document Binding',
                'total_amount' => 484.00,
                'status' => 'In Progress',
                'notes' => 'Thesis binding - 5 copies',
                'preferred_pickup_date' => $now->copy()->addDays(2)->format('Y-m-d'),
                'completed_date' => null,
                'created_at' => $now->copy()->subDays(1),
                'updated_at' => $now->copy()->subHours(3),
                'items' => [
                    ['product_id' => 19, 'quantity' => 5, 'unit_price' => 220.00 / 5],
                    ['product_id' => 21, 'quantity' => 20, 'unit_price' => 8.00],
                ],
            ],
            
            // Pending Orders
            [
                'order_number' => 'ORD-2025-0006',
                'customer_name' => null,
                'service_type' => 'Printing',
                'total_amount' => 850.00,
                'status' => 'Pending',
                'notes' => 'Walk-in customer',
                'preferred_pickup_date' => $now->copy()->addDays(3)->format('Y-m-d'),
                'completed_date' => null,
                'created_at' => $now->copy()->subHours(8),
                'updated_at' => $now->copy()->subHours(8),
                'items' => [
                    ['product_id' => 1, 'quantity' => 2, 'unit_price' => 250.00],
                    ['product_id' => 2, 'quantity' => 1, 'unit_price' => 350.00],
                ],
            ],
            [
                'order_number' => 'ORD-2025-0007',
                'customer_name' => 'Carlos Mendoza',
                'service_type' => 'ID Creation',
                'total_amount' => 455.00,
                'status' => 'Pending',
                'notes' => 'Company IDs for new employees',
                'preferred_pickup_date' => $now->copy()->addDays(4)->format('Y-m-d'),
                'completed_date' => null,
                'created_at' => $now->copy()->subHours(4),
                'updated_at' => $now->copy()->subHours(4),
                'items' => [
                    ['product_id' => 6, 'quantity' => 1, 'unit_price' => 380.00],
                    ['product_id' => 8, 'quantity' => 5, 'unit_price' => 15.00],
                ],
            ],
            [
                'order_number' => 'ORD-2025-0008',
                'customer_name' => 'Lisa Fernandez',
                'service_type' => 'Tela Purchase',
                'total_amount' => 1360.00,
                'status' => 'Pending',
                'notes' => 'School uniform fabric for tailoring',
                'preferred_pickup_date' => $now->copy()->addDays(5)->format('Y-m-d'),
                'completed_date' => null,
                'created_at' => $now->copy()->subHours(2),
                'updated_at' => $now->copy()->subHours(2),
                'items' => [
                    ['product_id' => 11, 'quantity' => 8, 'unit_price' => 120.00],
                    ['product_id' => 12, 'quantity' => 4, 'unit_price' => 125.00],
                ],
            ],
        ];

        foreach ($orders as $orderData) {
            // Insert order
            $orderId = DB::table('orders')->insertGetId([
                'order_number' => $orderData['order_number'],
                'customer_name' => $orderData['customer_name'],
                'service_type' => $orderData['service_type'],
                'total_amount' => $orderData['total_amount'],
                'status' => $orderData['status'],
                'notes' => $orderData['notes'],
                'preferred_pickup_date' => $orderData['preferred_pickup_date'],
                'completed_date' => $orderData['completed_date'],
                'created_at' => $orderData['created_at'],
                'updated_at' => $orderData['updated_at'],
            ]);

            // Insert order items
            foreach ($orderData['items'] as $item) {
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'notes' => null,
                ]);

                // Update inventory (decrease quantity)
                DB::table('inventories')
                    ->where('product_id', $item['product_id'])
                    ->decrement('quantity', $item['quantity']);
            }

            // Insert payment if order is completed
            if ($orderData['status'] === 'Completed' && isset($orderData['payment'])) {
                DB::table('payments')->insert([
                    'order_id' => $orderId,
                    'payment_method' => $orderData['payment']['payment_method'],
                    'amount' => $orderData['payment']['amount'],
                    'reference_number' => $orderData['payment']['reference_number'],
                    'payment_date' => $orderData['completed_date'],
                    'processed_by' => 1, // Admin user
                    'notes' => $orderData['payment']['notes'],
                    'created_at' => $orderData['completed_date'],
                ]);
            }
        }
    }
}
