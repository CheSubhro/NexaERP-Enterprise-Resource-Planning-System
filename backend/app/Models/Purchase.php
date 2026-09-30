<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Purchase extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'purchases';

    protected $fillable = [
        'invoice_no',
        'supplier_id',
        'items',
        'total_amount',
        'purchase_date',
        'created_by',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'float',
        'purchase_date' => 'datetime',
    ];
}