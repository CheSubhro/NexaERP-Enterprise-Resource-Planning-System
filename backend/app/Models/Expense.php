<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Expense extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'expenses';

    protected $fillable = [
        'category',
        'amount',
        'expense_date',
        'description',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'float',
        'expense_date' => 'datetime',
    ];
}