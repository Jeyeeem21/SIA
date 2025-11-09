<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RentalTenant;

class RentalTenantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = [
            [
                'name' => 'Maria Santos',
                'business_name' => 'Santos Canteen Services',
                'contact_number' => '09171234567',
                'email' => 'maria.santos@gmail.com',
                'property_rented_id' => 1, // School Canteen
                'contract_status' => 'Active',
                'deposit_paid' => 30000,
                'last_payment_date' => '2025-11-01',
            ],
            [
                'name' => 'Pedro Garcia',
                'business_name' => 'Garcia Boarding House',
                'contact_number' => '09187654321',
                'email' => 'pedro.garcia@yahoo.com',
                'property_rented_id' => 2, // Boarding House A
                'contract_status' => 'Active',
                'deposit_paid' => 50000,
                'last_payment_date' => '2025-11-01',
            ],
            [
                'name' => 'Ana Reyes',
                'business_name' => 'Reyes School Supplies',
                'contact_number' => '09161112222',
                'email' => 'ana.reyes@gmail.com',
                'property_rented_id' => 4, // School Bookstore
                'contract_status' => 'Active',
                'deposit_paid' => 24000,
                'last_payment_date' => '2025-11-01',
            ],
            [
                'name' => 'Carlos Mendoza',
                'business_name' => 'Mendoza Printing Services',
                'contact_number' => '09173334444',
                'email' => 'carlos.m@hotmail.com',
                'property_rented_id' => null,
                'contract_status' => 'Inactive',
                'deposit_paid' => 0,
                'last_payment_date' => '2024-12-01',
            ],
        ];

        foreach ($tenants as $tenant) {
            RentalTenant::create($tenant);
        }
    }
}
