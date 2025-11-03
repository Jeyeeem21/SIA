<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $primaryKey = 'category_id';
    
    protected $fillable = [
        'category_name',
        'description',
        'icon',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Relationships
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'category_id');
    }
}
