<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $dashboardData = Cache::remember(
            'nexaerp_dashboard',
            now()->addSeconds(30),
            function () {
                $totalSales = Sale::sum('total_amount');

                $totalPurchase = Purchase::sum('total_amount');

                $totalExpenses = Expense::sum('amount');

                $totalProducts = Product::count();

                $lowStockProducts = Product::whereRaw([
                    '$expr' => [
                        '$lte' => ['$stock', '$low_stock_threshold'],
                    ],
                ])->count();

                $recentSales = Sale::orderByDesc('created_at')
                    ->limit(5)
                    ->get();

                $recentPurchases = Purchase::orderByDesc('created_at')
                    ->limit(5)
                    ->get();

                $recentExpenses = Expense::orderByDesc('created_at')
                    ->limit(5)
                    ->get();

                return [
                    'summary' => [
                        'total_sales' => $totalSales,
                        'total_purchase' => $totalPurchase,
                        'total_expenses' => $totalExpenses,
                        'total_products' => $totalProducts,
                        'low_stock_products' => $lowStockProducts,
                    ],
                    'recent_sales' => $recentSales,
                    'recent_purchases' => $recentPurchases,
                    'recent_expenses' => $recentExpenses,
                ];
            },
        );

        return response()->json([
            'message' => 'Dashboard data retrieved successfully.',
            'data' => $dashboardData,
        ]);
    }
}

