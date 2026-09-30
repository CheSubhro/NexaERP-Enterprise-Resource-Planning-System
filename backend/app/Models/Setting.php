<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Setting extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'settings';

    protected $fillable = [
        'company_name',
        'logo',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'pincode',
        'gst_number',
        'website',

        'invoice_prefix',
        'invoice_footer',
        'currency',
        'currency_symbol',

        'date_format',
        'timezone',
        'default_low_stock_threshold',

        'app_name',
        'app_logo',
    ];

    protected $casts = [
        'default_low_stock_threshold' => 'integer',
    ];
}