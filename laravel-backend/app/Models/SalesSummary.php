<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesSummary extends Model
{
    protected $table = 'sales_summary';
    protected $primaryKey = 'summary_id';

    protected $fillable = [
        'date',
        'period_type',
        'total_sales',
        'total_orders',
        'previous_period_sales',
        'growth_rate',
    ];

    protected $casts = [
        'date' => 'date',
        'total_sales' => 'decimal:2',
        'previous_period_sales' => 'decimal:2',
        'growth_rate' => 'decimal:2',
    ];
}
