<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RentalProperty;

class RentalPropertiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $properties = [
            [
                'name' => 'School Canteen',
                'type' => 'Commercial',
                'location' => 'Ground Floor, Main Building',
                'size' => '150 sqm',
                'monthly_rate' => 15000,
                'status' => 'Occupied',
                'contract_end_date' => '2026-06-30',
            ],
            [
                'name' => 'Boarding House A',
                'type' => 'Residential',
                'location' => 'Behind Admin Building',
                'size' => '200 sqm (10 rooms)',
                'monthly_rate' => 25000,
                'status' => 'Occupied',
                'contract_end_date' => '2026-12-31',
            ],
            [
                'name' => 'Photocopy Center',
                'type' => 'Commercial',
                'location' => 'Library Building, 1st Floor',
                'size' => '50 sqm',
                'monthly_rate' => 8000,
                'status' => 'Vacant',
                'contract_end_date' => null,
            ],
            [
                'name' => 'School Bookstore',
                'type' => 'Commercial',
                'location' => 'Ground Floor, East Wing',
                'size' => '80 sqm',
                'monthly_rate' => 12000,
                'status' => 'Occupied',
                'contract_end_date' => '2026-08-15',
            ],
            [
                'name' => 'Parking Space - North',
                'type' => 'Commercial',
                'location' => 'North Parking Area',
                'size' => '100 sqm (20 slots)',
                'monthly_rate' => 10000,
                'status' => 'Vacant',
                'contract_end_date' => null,
            ],
        ];

        foreach ($properties as $property) {
            RentalProperty::create($property);
        }
    }
}
