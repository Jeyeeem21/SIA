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
        if (!Schema::hasTable('product_transactions')) {
            Schema::create('product_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products', 'product_id')->onDelete('cascade');
                $table->enum('type', ['IN', 'OUT'])->comment('IN = stock added, OUT = stock sold/removed');
                $table->integer('quantity');
                $table->decimal('unit_price', 10, 2)->default(0);
                $table->decimal('total_amount', 10, 2)->default(0);
                $table->string('reference_type')->nullable()->comment('order, restock, adjustment, etc');
                $table->unsignedBigInteger('reference_id')->nullable()->comment('ID of the related record');
                $table->foreignId('user_id')->nullable()->constrained('users', 'id')->onDelete('set null');
                $table->text('notes')->nullable();
                $table->timestamps();

                // Indexes for faster queries
                $table->index('product_id');
                $table->index('type');
                $table->index(['reference_type', 'reference_id']);
                $table->index('created_at');
            });
        } else {
            // Table exists but columns are missing - add them
            Schema::table('product_transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('product_transactions', 'product_id')) {
                    $table->foreignId('product_id')->after('id')->constrained('products', 'product_id')->onDelete('cascade');
                }
                if (!Schema::hasColumn('product_transactions', 'type')) {
                    $table->enum('type', ['IN', 'OUT'])->after('product_id')->comment('IN = stock added, OUT = stock sold/removed');
                }
                if (!Schema::hasColumn('product_transactions', 'quantity')) {
                    $table->integer('quantity')->after('type');
                }
                if (!Schema::hasColumn('product_transactions', 'unit_price')) {
                    $table->decimal('unit_price', 10, 2)->default(0)->after('quantity');
                }
                if (!Schema::hasColumn('product_transactions', 'total_amount')) {
                    $table->decimal('total_amount', 10, 2)->default(0)->after('unit_price');
                }
                if (!Schema::hasColumn('product_transactions', 'reference_type')) {
                    $table->string('reference_type')->nullable()->after('total_amount')->comment('order, restock, adjustment, etc');
                }
                if (!Schema::hasColumn('product_transactions', 'reference_id')) {
                    $table->unsignedBigInteger('reference_id')->nullable()->after('reference_type')->comment('ID of the related record');
                }
                if (!Schema::hasColumn('product_transactions', 'user_id')) {
                    $table->foreignId('user_id')->nullable()->after('reference_id')->constrained('users', 'id')->onDelete('set null');
                }
                if (!Schema::hasColumn('product_transactions', 'notes')) {
                    $table->text('notes')->nullable()->after('user_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_transactions');
    }
};
