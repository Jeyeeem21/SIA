<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TogaDepartment extends Model
{
    protected $fillable = [
        'name',
        'code',
        'color',
        'icon',
    ];

    public function rentals(): HasMany
    {
        return $this->hasMany(TogaRental::class, 'toga_department_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(TogaPayment::class, 'toga_department_id');
    }

    public function activeRentals(): HasMany
    {
        return $this->hasMany(TogaRental::class, 'toga_department_id')->where('status', 'Active');
    }
}
