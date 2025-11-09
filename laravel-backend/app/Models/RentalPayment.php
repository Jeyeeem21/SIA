<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalPayment extends Model
{
    protected $fillable = [
        'payment_number',
        'tenant_id',
        'property_id',
        'amount',
        'payment_date',
        'month',
        'method',
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date'
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(RentalTenant::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(RentalProperty::class);
    }

    // Helper methods
    public function isPaid(): bool
    {
        return $this->status === 'Paid';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'Overdue';
    }

    public function getTenantName()
    {
        return $this->tenant?->name ?? 'Unknown Tenant';
    }

    public function getPropertyName()
    {
        return $this->property?->name ?? 'Unknown Property';
    }
}
