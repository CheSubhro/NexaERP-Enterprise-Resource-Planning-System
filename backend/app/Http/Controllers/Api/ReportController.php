<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function sales(): JsonResponse
    {
        $sales = Sale::orderByDesc('sale_date')->get();

        return response()->json([
            'message' => 'Sales report retrieved successfully.',
            'data' => [
                'total_sales' => $sales->sum('total_amount'),
                'total_transactions' => $sales->count(),
                'sales' => $sales,
            ],
        ]);
    }

    public function purchases(): JsonResponse
    {
        $purchases = Purchase::orderByDesc('purchase_date')->get();

        return response()->json([
            'message' => 'Purchase report retrieved successfully.',
            'data' => [
                'total_purchase' => $purchases->sum('total_amount'),
                'total_transactions' => $purchases->count(),
                'purchases' => $purchases,
            ],
        ]);
    }

    public function expenses(): JsonResponse
    {
        $expenses = Expense::orderByDesc('expense_date')->get();

        return response()->json([
            'message' => 'Expense report retrieved successfully.',
            'data' => [
                'total_expenses' => $expenses->sum('amount'),
                'total_transactions' => $expenses->count(),
                'expenses' => $expenses,
            ],
        ]);
    }

    public function stock(): JsonResponse
    {
        $products = Product::orderBy('name')->get();

        $totalStock = $products->sum('stock');

        $lowStockProducts = $products->filter(function ($product) {
            return $product->stock <= $product->low_stock_threshold;
        })->values();

        return response()->json([
            'message' => 'Stock report retrieved successfully.',
            'data' => [
                'total_products' => $products->count(),
                'total_stock_units' => $totalStock,
                'low_stock_count' => $lowStockProducts->count(),
                'low_stock_products' => $lowStockProducts,
                'products' => $products,
            ],
        ]);
    }
}