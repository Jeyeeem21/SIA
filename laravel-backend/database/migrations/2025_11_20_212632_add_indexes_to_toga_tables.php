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
        Schema::table('toga_departments', function (Blueprint $table) {
            $table->index('code');
            $table->index('created_at');
        });

        Schema::table('toga_rentals', function (Blueprint $table) {
            $table->index('toga_department_id');
            $table->index('payment_status');
            $table->index('rental_date');
            $table->index('return_date');
            $table->index('created_at');
            $table->index(['toga_department_id', 'status']);
            $table->index(['toga_department_id', 'created_at']);
        });

        Schema::table('toga_payments', function (Blueprint $table) {
            $table->index('toga_department_id');
            $table->index('toga_rental_id');
            $table->index('payment_date');
            $table->index('created_at');
            $table->index(['toga_department_id', 'status']);
            $table->index(['toga_department_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('toga_departments', function (Blueprint $table) {
            $table->dropIndex(['code']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('toga_rentals', function (Blueprint $table) {
            $table->dropIndex(['toga_department_id']);
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['rental_date']);
            $table->dropIndex(['return_date']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['toga_department_id', 'status']);
            $table->dropIndex(['toga_department_id', 'created_at']);
        });

        Schema::table('toga_payments', function (Blueprint $table) {
            $table->dropIndex(['toga_department_id']);
            $table->dropIndex(['toga_rental_id']);
            $table->dropIndex(['payment_date']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['toga_department_id', 'status']);
            $table->dropIndex(['toga_department_id', 'created_at']);
        });
    }
};
