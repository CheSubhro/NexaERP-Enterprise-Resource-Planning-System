<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;

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

    /*
    |--------------------------------------------------------------------------
    | Sales
    |--------------------------------------------------------------------------
    */

    Route::get('/sales', [SaleController::class, 'index'])
        ->middleware('permission:sales.view');

    Route::post('/sales', [SaleController::class, 'store'])
        ->middleware('permission:sales.create');

    Route::get('/sales/{id}', [SaleController::class, 'show'])
        ->middleware('permission:sales.view');

    /*
    |--------------------------------------------------------------------------
    | Purchases
    |--------------------------------------------------------------------------
    */

    Route::get('/purchases', [PurchaseController::class, 'index'])
        ->middleware('permission:purchases.view');

    Route::post('/purchases', [PurchaseController::class, 'store'])
        ->middleware('permission:purchases.create');

    Route::get('/purchases/{id}', [PurchaseController::class, 'show'])
        ->middleware('permission:purchases.view');

    /*
    |--------------------------------------------------------------------------
    | Expenses
    |--------------------------------------------------------------------------
    */

    Route::get('/expenses', [ExpenseController::class, 'index'])
        ->middleware('permission:expenses.view');

    Route::post('/expenses', [ExpenseController::class, 'store'])
        ->middleware('permission:expenses.create');

    Route::get('/expenses/{id}', [ExpenseController::class, 'show'])
        ->middleware('permission:expenses.view');

    Route::put('/expenses/{id}', [ExpenseController::class, 'update'])
        ->middleware('permission:expenses.update');

    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy'])
        ->middleware('permission:expenses.delete');  
        
    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view');

    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    Route::get('/reports/sales', [ReportController::class, 'sales'])
        ->middleware('permission:reports.view');

    Route::get('/reports/purchases', [ReportController::class, 'purchases'])
        ->middleware('permission:reports.view');

    Route::get('/reports/expenses', [ReportController::class, 'expenses'])
        ->middleware('permission:reports.view');

    Route::get('/reports/stock', [ReportController::class, 'stock'])
        ->middleware('permission:reports.view'); 
        
    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */    
        
    Route::get('/users', [UserController::class, 'index'])
    ->middleware('permission:users.view');

    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:users.create');

    Route::get('/users/{id}', [UserController::class, 'show'])
        ->middleware('permission:users.view');

    Route::put('/users/{id}', [UserController::class, 'update'])
        ->middleware('permission:users.update');

    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('permission:users.delete');

});