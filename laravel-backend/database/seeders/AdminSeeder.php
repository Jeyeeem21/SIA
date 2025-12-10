<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the admin user account.
     */
    public function run(): void
    {
        // Create default admin account
        User::firstOrCreate(
            ['email' => 'admin@sia.com'],
            [
                'full_name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'phone' => '09123456789',
                'role' => 'Admin',
                'status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create additional test admin (optional)
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'full_name' => 'Test Admin',
                'password' => Hash::make('password'),
                'phone' => '09987654321',
                'role' => 'Admin',
                'status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Admin accounts created successfully!');
        $this->command->info('📧 Admin Email: admin@sia.com | Password: admin123');
        $this->command->info('📧 Test Email: test@example.com | Password: password');
    }
}
