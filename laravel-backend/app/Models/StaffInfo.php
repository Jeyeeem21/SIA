<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffInfo extends Model
{
    protected $table = 'staff_info';

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'address',
        'date_of_birth',
        'gender',
        'position',
        'department',
        'hire_date',
        'user_id',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
