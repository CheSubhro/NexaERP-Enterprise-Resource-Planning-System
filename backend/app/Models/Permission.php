<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Permission extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'permissions';

    protected $fillable = [
        'name',
        'slug',
        'module',
        'description',
    ];
}