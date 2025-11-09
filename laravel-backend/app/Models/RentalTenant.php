<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalTenant extends Model
{
    protected $fillable = [
        'name',
        'business_name',
        'contact_number',
        'email',
        'property_rented_id',
        'contract_status',
        'deposit_paid',
        'last_payment_date'
    ];

    protected $casts = [
        'deposit_paid' => 'decimal:2',
        'last_payment_date' => 'date'
    ];

    // Relationships
    public function propertyRented(): BelongsTo
    {
        return $this->belongsTo(RentalProperty::class, 'property_rented_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(RentalContract::class, 'tenant_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(RentalPayment::class);
    }

    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(RentalMaintenance::class);
    }

    // Helper methods
    public function isActive(): bool
    {
        return $this->contract_status === 'Active';
    }

    public function getPropertyName()
    {
        return $this->propertyRented?->name ?? 'No Property Assigned';
    }
}
