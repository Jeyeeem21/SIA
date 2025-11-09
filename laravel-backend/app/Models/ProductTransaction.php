<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductTransaction extends Model
{
    protected $table = 'product_transactions';
    protected $primaryKey = 'transaction_id';

    protected $fillable = [
        'product_id',
        'transaction_type',
        'type',
        'quantity',
        'unit_price',
        'total_amount',
        'previous_quantity',
        'new_quantity',
        'reference_type',
        'reference_id',
        'notes',
        'user_id',
    ];

    /**
     * Get the product associated with this transaction
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Get the user who performed this transaction
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'performed_by', 'id');
    }
}
