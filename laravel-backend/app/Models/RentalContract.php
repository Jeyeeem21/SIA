<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalContract extends Model
{
    protected $fillable = [
        'contract_number',
        'property_id',
        'tenant_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'deposit',
        'status'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'monthly_rent' => 'decimal:2',
        'deposit' => 'decimal:2'
    ];

    // Relationships
    public function property(): BelongsTo
    {
        return $this->belongsTo(RentalProperty::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(RentalTenant::class);
    }

    // Helper methods
    public function isActive(): bool
    {
        return $this->status === 'Active';
    }

    public function isExpired(): bool
    {
        return $this->status === 'Expired' || now()->isAfter($this->end_date);
    }

    public function getDaysRemaining(): int
    {
        return now()->diffInDays($this->end_date, false);
    }

    public function getPropertyName()
    {
        return $this->property?->name ?? 'Unknown Property';
    }

    public function getTenantName()
    {
        return $this->tenant?->name ?? 'Unknown Tenant';
    }
}
