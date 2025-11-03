<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $primaryKey = 'order_id';
    
    protected $fillable = [
        'order_number',
        'customer_name',
        'service_type',
        'total_amount',
        'status',
        'notes',
        'preferred_pickup_date',
        'completed_date',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'preferred_pickup_date' => 'date',
        'completed_date' => 'datetime',
        'status' => 'string',
        'service_type' => 'string',
    ];

    // Relationships
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'order_id', 'order_id');
    }
}
