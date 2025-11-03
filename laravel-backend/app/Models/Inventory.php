<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $primaryKey = 'inventory_id';
    
    public $timestamps = false;
    
    protected $fillable = [
        'product_id',
        'quantity',
        'reorder_level',
        'reorder_quantity',
        'last_restock_date',
        'last_restock_quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reorder_level' => 'integer',
        'reorder_quantity' => 'integer',
        'last_restock_quantity' => 'integer',
        'last_restock_date' => 'date',
    ];

    // Status is auto-generated, so it's appended to the model
    protected $appends = ['status'];

    public function getStatusAttribute()
    {
        if ($this->quantity == 0) {
            return 'out';
        } elseif ($this->quantity <= $this->reorder_level) {
            return 'low';
        } else {
            return 'available';
        }
    }

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
