<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalMaintenance extends Model
{
    protected $table = 'rental_maintenance';

    protected $fillable = [
        'request_number',
        'property_id',
        'tenant_id',
        'issue',
        'priority',
        'status',
        'date_reported',
        'assigned_to'
    ];

    protected $casts = [
        'date_reported' => 'date'
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
    public function isCompleted(): bool
    {
        return $this->status === 'Completed';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'In Progress';
    }

    public function isHighPriority(): bool
    {
        return in_array($this->priority, ['High', 'Critical']);
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
