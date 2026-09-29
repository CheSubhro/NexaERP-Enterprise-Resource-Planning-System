<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Product extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'products';

    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'description',
        'purchase_price',
        'selling_price',
        'stock',
        'low_stock_threshold',
        'unit',
        'status',
        'created_by',
    ];

    protected $casts = [
        'purchase_price' => 'float',
        'selling_price' => 'float',
        'stock' => 'integer',
        'low_stock_threshold' => 'integer',
    ];
}