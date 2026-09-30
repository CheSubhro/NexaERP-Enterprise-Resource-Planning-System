<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::orderBy('name')->get();

        return response()->json([
            'message' => 'Products retrieved successfully.',
            'data' => $products,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'sku' => ['required', 'string', 'max:100'],
            'category_id' => ['required', 'string'],
            'description' => ['nullable', 'string', 'max:1000'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $category = Category::find($validated['category_id']);

        if (! $category) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        $skuExists = Product::where('sku', $validated['sku'])->exists();

        if ($skuExists) {
            return response()->json([
                'message' => 'A product with this SKU already exists.',
            ], 422);
        }

        $product = Product::create([
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'category_id' => $validated['category_id'],
            'description' => $validated['description'] ?? null,
            'purchase_price' => $validated['purchase_price'],
            'selling_price' => $validated['selling_price'],
            'stock' => $validated['stock'] ?? 0,
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
            'unit' => $validated['unit'] ?? 'pcs',
            'status' => $validated['status'] ?? 'active',
            'created_by' => $request->user()->_id,
        ]);

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Product retrieved successfully.',
            'data' => $product,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'sku' => ['sometimes', 'required', 'string', 'max:100'],
            'category_id' => ['sometimes', 'required', 'string'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'purchase_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'selling_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0'],
            'unit' => ['sometimes', 'nullable', 'string', 'max:50'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        if (isset($validated['category_id'])) {
            $category = Category::find($validated['category_id']);

            if (! $category) {
                return response()->json([
                    'message' => 'Category not found.',
                ], 404);
            }
        }

        if (isset($validated['sku'])) {
            $skuExists = Product::where('sku', $validated['sku'])
                ->where('_id', '!=', $product->_id)
                ->exists();

            if ($skuExists) {
                return response()->json([
                    'message' => 'A product with this SKU already exists.',
                ], 422);
            }
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => $product->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $productId = (string) $product->_id;

        $usedInSales = Sale::where('items.product_id', $productId)->exists();

        $usedInPurchases = Purchase::where('items.product_id', $productId)->exists();

        if ($usedInSales || $usedInPurchases) {
            return response()->json([
                'message' => 'This product cannot be deleted because it is already used in sales or purchases.',
            ], 422);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }
}

