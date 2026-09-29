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
    ];

    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            null,
            'role_ids',
            '_id'
        );
    }
}