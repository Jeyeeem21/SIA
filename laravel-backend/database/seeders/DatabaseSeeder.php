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
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'full_name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'Admin',
                'status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        // Seed all tables
        $this->call([
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
