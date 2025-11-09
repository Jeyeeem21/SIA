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
        Schema::table('orders', function (Blueprint $table) {
            // Make service_type nullable (we'll use category from products)
            $table->string('service_type', 100)->nullable()->change();
            
            // Add void fields
            $table->boolean('is_voided')->default(false)->after('status');
            $table->text('void_reason')->nullable()->after('is_voided');
            $table->unsignedBigInteger('voided_by')->nullable()->after('void_reason');
            $table->timestamp('voided_at')->nullable()->after('voided_by');
            
            $table->index('is_voided');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['is_voided', 'void_reason', 'voided_by', 'voided_at']);
            
            // Revert service_type back to enum
            $table->enum('service_type', ['Printing', 'ID Creation', 'Tela Purchase', 'Lamination', 'Document Binding', 'Uniform', 'Other'])->change();
        });
    }
};
