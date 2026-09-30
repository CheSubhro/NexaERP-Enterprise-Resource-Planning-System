<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $items = [];
        $totalAmount = 0;

        foreach ($validated['items'] as $item) {
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

        $invoiceNo = 'INV-' . strtoupper(Str::random(8));

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
                $item['quantity']
            );
        }

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