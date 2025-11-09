<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RentalContract;

class RentalContractsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contracts = [
            [
                'contract_number' => 'RNT-2025-001',
                'property_id' => 1, // School Canteen
                'tenant_id' => 1, // Maria Santos
                'start_date' => '2025-07-01',
                'end_date' => '2026-06-30',
                'monthly_rent' => 15000,
                'deposit' => 30000,
                'status' => 'Active',
            ],
            [
                'contract_number' => 'RNT-2025-002',
                'property_id' => 2, // Boarding House A
                'tenant_id' => 2, // Pedro Garcia
                'start_date' => '2025-01-01',
                'end_date' => '2026-12-31',
                'monthly_rent' => 25000,
                'deposit' => 50000,
                'status' => 'Active',
            ],
            [
                'contract_number' => 'RNT-2025-003',
                'property_id' => 4, // School Bookstore
                'tenant_id' => 3, // Ana Reyes
                'start_date' => '2025-09-01',
                'end_date' => '2026-08-15',
                'monthly_rent' => 12000,
                'deposit' => 24000,
                'status' => 'Active',
            ],
            [
                'contract_number' => 'RNT-2024-015',
                'property_id' => 3, // Photocopy Center
                'tenant_id' => 4, // Carlos Mendoza
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'monthly_rent' => 8000,
                'deposit' => 16000,
                'status' => 'Expired',
            ],
        ];

        foreach ($contracts as $contract) {
            RentalContract::create($contract);
        }
    }
}
