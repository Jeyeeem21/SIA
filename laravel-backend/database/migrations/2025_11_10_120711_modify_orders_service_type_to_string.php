<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Change service_type from ENUM to VARCHAR to accept category names
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Change service_type from enum to string to accept dynamic category names
            $table->string('service_type', 100)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Revert back to enum (for rollback)
            $table->enum('service_type', ['Printing', 'ID Creation', 'Tela Purchase', 'Lamination', 'Document Binding', 'Uniform', 'Other'])->change();
        });
    }
};
