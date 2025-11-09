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
        Schema::table('product_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->after('id');
            $table->enum('type', ['IN', 'OUT'])->after('product_id');
            $table->integer('quantity')->after('type');
            $table->decimal('unit_price', 10, 2)->after('quantity');
            $table->decimal('total_amount', 10, 2)->after('unit_price');
            $table->string('reference_type', 50)->nullable()->after('total_amount');
            $table->unsignedBigInteger('reference_id')->nullable()->after('reference_type');
            $table->unsignedBigInteger('performed_by')->nullable()->after('reference_id');
            $table->timestamp('transaction_date')->after('performed_by');
            $table->text('notes')->nullable()->after('transaction_date');
            
            // Foreign keys
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->foreign('performed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_transactions', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['performed_by']);
            $table->dropColumn([
                'product_id',
                'type',
                'quantity',
                'unit_price',
                'total_amount',
                'reference_type',
                'reference_id',
                'performed_by',
                'transaction_date',
                'notes'
            ]);
        });
    }
};
