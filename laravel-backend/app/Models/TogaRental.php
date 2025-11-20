<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TogaRental extends Model
{
    protected $fillable = [
        'toga_department_id',
        'student_name',
        'student_number',
        'contact_number',
        'size',
        'rental_date',
        'return_date',
        'rental_fee',
        'deposit',
        'status',
        'payment_status',
    ];

    protected $casts = [
        'rental_date' => 'date',
        'return_date' => 'date',
        'rental_fee' => 'decimal:2',
        'deposit' => 'decimal:2',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(TogaDepartment::class, 'toga_department_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(TogaPayment::class, 'toga_rental_id');
    }
}
