<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalProperty extends Model
{
    protected $fillable = [
        'name',
        'stall_number',
        'type',
        'location',
        'size',
        'monthly_rate',
        'status',
        'contract_end_date'
    ];

    protected $casts = [
        'monthly_rate' => 'decimal:2',
        'contract_end_date' => 'date'
    ];

    // Relationships
    public function tenants(): HasMany
    {
        return $this->hasMany(RentalTenant::class, 'property_rented_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(RentalContract::class, 'property_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(RentalPayment::class);
    }

    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(RentalMaintenance::class);
    }

    // Get current tenant through active contract
    public function getCurrentTenant()
    {
        return $this->contracts()
            ->where('status', 'Active')
            ->with('tenant')
            ->first()?->tenant;
    }
}
