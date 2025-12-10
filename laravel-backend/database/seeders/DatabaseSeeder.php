<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed all tables
        $this->call([
            AdminSeeder::class,           // Create admin accounts first
            CategorySeeder::class,
            ProductSeeder::class,
            InventorySeeder::class,
            RentalPropertiesSeeder::class,
            RentalTenantsSeeder::class,
            RentalContractsSeeder::class,
            RentalPaymentsSeeder::class,
            RentalMaintenanceSeeder::class,
        ]);
    }
}
