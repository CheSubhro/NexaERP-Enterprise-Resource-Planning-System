<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Role extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'roles';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'permission_ids',
    ];

    protected $casts = [
        'permission_ids' => 'array',
    ];
}