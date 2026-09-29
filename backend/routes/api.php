<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::middleware([
    'auth:sanctum',
    'permission:products.create',
])->get('/test/products-create', function () {
    return response()->json([
        'message' => 'You have products.create permission.',
    ]);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/categories', [CategoryController::class, 'index'])
        ->middleware('permission:products.view');

    Route::post('/categories', [CategoryController::class, 'store'])
        ->middleware('permission:products.create');

    Route::get('/categories/{id}', [CategoryController::class, 'show'])
        ->middleware('permission:products.view');

    Route::put('/categories/{id}', [CategoryController::class, 'update'])
        ->middleware('permission:products.update');

    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])
        ->middleware('permission:products.delete');
});