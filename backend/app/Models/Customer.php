<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Customer extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'customers';

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'pincode',
        'status',
        'created_by',
    ];

    protected $casts = [
        'phone' => 'string',
        'pincode' => 'string',
    ];
}