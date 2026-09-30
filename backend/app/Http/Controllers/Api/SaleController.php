<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaleController extends Controller
{
    public function index(): JsonResponse
    {
        $sales = Sale::orderByDesc('sale_date')->get();

        return response()->json([
            'message' => 'Sales retrieved successfully.',
            'data' => $sales,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'sale_date' => ['nullable', 'date'],
        ]);

        $customer = Customer::find($validated['customer_id']);

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found.',
            ], 404);
        }

        /*
         * Merge duplicate products.
         * If the same product appears multiple times,
         * quantities are combined and the first item's price is used.
         */
        $groupedItems = [];

        foreach ($validated['items'] as $item) {
            $productId = $item['product_id'];

            if (! isset($groupedItems[$productId])) {
                $groupedItems[$productId] = [
                    'product_id' => $productId,
                    'quantity' => 0,
                    'price' => $item['price'],
                ];
            }

            $groupedItems[$productId]['quantity'] += $item['quantity'];
        }

        /*
         * Validate all products and stock before changing anything.
         */
        $items = [];
        $totalAmount = 0;

        foreach ($groupedItems as $item) {
            $product = Product::find($item['product_id']);

            if (! $product) {
                return response()->json([
                    'message' => 'Product not found.',
                    'product_id' => $item['product_id'],
                ], 404);
            }

            if ($product->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Insufficient stock.',
                    'product' => $product->name,
                    'available_stock' => $product->stock,
                    'requested_quantity' => $item['quantity'],
                ], 422);
            }

            $subtotal = $item['quantity'] * $item['price'];

            $items[] = [
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $subtotal,
            ];

            $totalAmount += $subtotal;
        }

        $settings = Setting::first();

        $invoicePrefix = $settings?->invoice_prefix ?: 'INV-';

        $invoiceNo = $invoicePrefix . strtoupper(Str::random(8));

        $sale = DB::connection('mongodb')->transaction(function () use (
            $validated,
            $items,
            $totalAmount,
            $invoiceNo,
            $request,
        ) {
            $sale = Sale::create([
                'invoice_no' => $invoiceNo,
                'customer_id' => $validated['customer_id'],
                'items' => $items,
                'total_amount' => $totalAmount,
                'sale_date' => $validated['sale_date'] ?? now(),
                'created_by' => $request->user()->_id,
            ]);

            foreach ($items as $item) {
                $product = Product::find($item['product_id']);

                $product->decrement(
                    'stock',
                    $item['quantity'],
                );
            }

            return $sale;
        });

        return response()->json([
            'message' => 'Sale created successfully.',
            'data' => $sale,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $sale = Sale::find($id);

        if (! $sale) {
            return response()->json([
                'message' => 'Sale not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Sale retrieved successfully.',
            'data' => $sale,
        ]);
    }
}