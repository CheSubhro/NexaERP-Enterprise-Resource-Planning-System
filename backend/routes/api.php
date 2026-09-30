<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SupplierController;

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    Route::get('/products', [ProductController::class, 'index'])
        ->middleware('permission:products.view');

    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('permission:products.create');

    Route::get('/products/{id}', [ProductController::class, 'show'])
        ->middleware('permission:products.view');

    Route::put('/products/{id}', [ProductController::class, 'update'])
        ->middleware('permission:products.update');

    Route::delete('/products/{id}', [ProductController::class, 'destroy'])
        ->middleware('permission:products.delete');

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Route::get('/customers', [CustomerController::class, 'index'])
        ->middleware('permission:customers.view');

    Route::post('/customers', [CustomerController::class, 'store'])
        ->middleware('permission:customers.create');

    Route::get('/customers/{id}', [CustomerController::class, 'show'])
        ->middleware('permission:customers.view');

    Route::put('/customers/{id}', [CustomerController::class, 'update'])
        ->middleware('permission:customers.update');

    Route::delete('/customers/{id}', [CustomerController::class, 'destroy'])
        ->middleware('permission:customers.delete'); 
        
    /*
    |--------------------------------------------------------------------------
    | Suppliers
    |--------------------------------------------------------------------------
    */

    Route::get('/suppliers', [SupplierController::class, 'index'])
        ->middleware('permission:suppliers.view');

    Route::post('/suppliers', [SupplierController::class, 'store'])
        ->middleware('permission:suppliers.create');

    Route::get('/suppliers/{id}', [SupplierController::class, 'show'])
        ->middleware('permission:suppliers.view');

    Route::put('/suppliers/{id}', [SupplierController::class, 'update'])
        ->middleware('permission:suppliers.update');

    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy'])
        ->middleware('permission:suppliers.delete');

});