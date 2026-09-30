<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Supplier extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'suppliers';

    protected $fillable = [
        'name',
        'company_name',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'pincode',
        'gst_number',
        'status',
        'created_by',
    ];

    protected $casts = [
        'phone' => 'string',
        'pincode' => 'string',
    ];
}