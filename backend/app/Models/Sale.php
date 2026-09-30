<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Sale extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'sales';

    protected $fillable = [
        'invoice_no',
        'customer_id',
        'items',
        'total_amount',
        'sale_date',
        'created_by',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'float',
        'sale_date' => 'datetime',
    ];
}