<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RentalPayment;

class RentalPaymentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $payments = [
            [
                'payment_number' => 'PAY-2025-011',
                'tenant_id' => 1, // Maria Santos
                'property_id' => 1, // School Canteen
                'amount' => 15000,
                'payment_date' => '2025-11-01',
                'month' => 'November 2025',
                'method' => 'Bank Transfer',
                'status' => 'Paid',
            ],
            [
                'payment_number' => 'PAY-2025-012',
                'tenant_id' => 2, // Pedro Garcia
                'property_id' => 2, // Boarding House A
                'amount' => 25000,
                'payment_date' => '2025-11-01',
                'month' => 'November 2025',
                'method' => 'Cash',
                'status' => 'Paid',
            ],
            [
                'payment_number' => 'PAY-2025-013',
                'tenant_id' => 3, // Ana Reyes
                'property_id' => 4, // School Bookstore
                'amount' => 12000,
                'payment_date' => '2025-11-01',
                'month' => 'November 2025',
                'method' => 'GCash',
                'status' => 'Paid',
            ],
            [
                'payment_number' => 'PAY-2025-014',
                'tenant_id' => 1, // Maria Santos
                'property_id' => 1, // School Canteen
                'amount' => 15000,
                'payment_date' => null,
                'month' => 'December 2025',
                'method' => null,
                'status' => 'Pending',
            ],
            [
                'payment_number' => 'PAY-2025-015',
                'tenant_id' => 2, // Pedro Garcia
                'property_id' => 2, // Boarding House A
                'amount' => 25000,
                'payment_date' => null,
                'month' => 'December 2025',
                'method' => null,
                'status' => 'Pending',
            ],
            [
                'payment_number' => 'PAY-2025-010',
                'tenant_id' => 1, // Maria Santos
                'property_id' => 1, // School Canteen
                'amount' => 15000,
                'payment_date' => '2025-10-02',
                'month' => 'October 2025',
                'method' => 'Bank Transfer',
                'status' => 'Paid',
            ],
            [
                'payment_number' => 'PAY-2025-008',
                'tenant_id' => 2, // Pedro Garcia
                'property_id' => 2, // Boarding House A
                'amount' => 25000,
                'payment_date' => '2025-09-30',
                'month' => 'September 2025',
                'method' => 'Cash',
                'status' => 'Overdue',
            ],
        ];

        foreach ($payments as $payment) {
            RentalPayment::create($payment);
        }
    }
}
