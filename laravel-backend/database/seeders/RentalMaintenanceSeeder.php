<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RentalMaintenance;

class RentalMaintenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $maintenance = [
            [
                'request_number' => 'MNT-2025-015',
                'property_id' => 1, // School Canteen
                'tenant_id' => 1, // Maria Santos
                'issue' => 'Leaking faucet in kitchen area',
                'priority' => 'Medium',
                'status' => 'In Progress',
                'date_reported' => '2025-11-03',
                'assigned_to' => 'Juan Dela Cruz',
            ],
            [
                'request_number' => 'MNT-2025-016',
                'property_id' => 2, // Boarding House A
                'tenant_id' => 2, // Pedro Garcia
                'issue' => 'Broken door lock in Room 5',
                'priority' => 'High',
                'status' => 'Pending',
                'date_reported' => '2025-11-04',
                'assigned_to' => null,
            ],
            [
                'request_number' => 'MNT-2025-017',
                'property_id' => 4, // School Bookstore
                'tenant_id' => 3, // Ana Reyes
                'issue' => 'Air conditioning not cooling properly',
                'priority' => 'High',
                'status' => 'Pending',
                'date_reported' => '2025-11-05',
                'assigned_to' => null,
            ],
            [
                'request_number' => 'MNT-2025-014',
                'property_id' => 2, // Boarding House A
                'tenant_id' => 2, // Pedro Garcia
                'issue' => 'Water heater in Room 3 not working',
                'priority' => 'Medium',
                'status' => 'Completed',
                'date_reported' => '2025-10-28',
                'assigned_to' => 'Juan Dela Cruz',
            ],
            [
                'request_number' => 'MNT-2025-013',
                'property_id' => 1, // School Canteen
                'tenant_id' => 1, // Maria Santos
                'issue' => 'Exhaust fan making loud noise',
                'priority' => 'Low',
                'status' => 'Completed',
                'date_reported' => '2025-10-25',
                'assigned_to' => 'Roberto Santos',
            ],
        ];

        foreach ($maintenance as $item) {
            RentalMaintenance::create($item);
        }
    }
}
