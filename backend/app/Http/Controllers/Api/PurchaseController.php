<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PurchaseController extends Controller
{
    public function index(): JsonResponse
    {
        $purchases = Purchase::orderByDesc('purchase_date')->get();

        return response()->json([
            'message' => 'Purchases retrieved successfully.',
            'data' => $purchases,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
        ]);

        $supplier = Supplier::find($validated['supplier_id']);

        if (! $supplier) {
            return response()->json([
                'message' => 'Supplier not found.',
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

            $subtotal = $item['quantity'] * $item['price'];

            $items[] = [
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $subtotal,
            ];

            $totalAmount += $subtotal;
        }

        $invoiceNo = 'PUR-' . strtoupper(Str::random(8));

        $purchase = Purchase::create([
            'invoice_no' => $invoiceNo,
            'supplier_id' => $validated['supplier_id'],
            'items' => $items,
            'total_amount' => $totalAmount,
            'purchase_date' => $validated['purchase_date'] ?? now(),
            'created_by' => $request->user()->_id,
        ]);

        foreach ($items as $item) {
            $product = Product::find($item['product_id']);

            $product->increment(
                'stock',
                $item['quantity']
            );
        }

        return response()->json([
            'message' => 'Purchase created successfully.',
            'data' => $purchase,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $purchase = Purchase::find($id);

        if (! $purchase) {
            return response()->json([
                'message' => 'Purchase not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Purchase retrieved successfully.',
            'data' => $purchase,
        ]);
    }
}