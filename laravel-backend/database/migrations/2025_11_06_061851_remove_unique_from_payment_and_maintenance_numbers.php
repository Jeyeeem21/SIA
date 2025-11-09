<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rental_payments', function (Blueprint $table) {
            $table->dropUnique('rental_payments_payment_number_unique');
        });
        
        Schema::table('rental_maintenance', function (Blueprint $table) {
            $table->dropUnique('rental_maintenance_request_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rental_payments', function (Blueprint $table) {
            $table->unique('payment_number');
        });
        
        Schema::table('rental_maintenance', function (Blueprint $table) {
            $table->unique('request_number');
        });
    }
};
