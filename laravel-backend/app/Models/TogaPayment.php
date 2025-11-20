<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TogaPayment extends Model
{
    protected $fillable = [
        'toga_rental_id',
        'toga_department_id',
        'payment_number',
        'student_name',
        'student_number',
        'amount',
        'payment_date',
        'payment_method',
        'status',
        'type',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function rental(): BelongsTo
    {
        return $this->belongsTo(TogaRental::class, 'toga_rental_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(TogaDepartment::class, 'toga_department_id');
    }
}
