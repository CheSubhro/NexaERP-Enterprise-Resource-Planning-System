<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(): JsonResponse
    {
        $suppliers = Supplier::orderBy('name')->get();

        return response()->json([
            'message' => 'Suppliers retrieved successfully.',
            'data' => $suppliers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'company_name' => ['nullable', 'string', 'max:200'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'pincode' => ['nullable', 'string', 'max:10'],
            'gst_number' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $phoneExists = Supplier::where('phone', $validated['phone'])->exists();

        if ($phoneExists) {
            return response()->json([
                'message' => 'A supplier with this phone number already exists.',
            ], 422);
        }

        if (! empty($validated['email'])) {
            $emailExists = Supplier::where('email', $validated['email'])->exists();

            if ($emailExists) {
                return response()->json([
                    'message' => 'A supplier with this email already exists.',
                ], 422);
            }
        }

        if (! empty($validated['gst_number'])) {
            $gstExists = Supplier::where(
                'gst_number',
                $validated['gst_number'],
            )->exists();

            if ($gstExists) {
                return response()->json([
                    'message' => 'A supplier with this GST number already exists.',
                ], 422);
            }
        }

        $supplier = Supplier::create([
            'name' => $validated['name'],
            'company_name' => $validated['company_name'] ?? null,
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'pincode' => $validated['pincode'] ?? null,
            'gst_number' => $validated['gst_number'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'created_by' => $request->user()->_id,
        ]);

        return response()->json([
            'message' => 'Supplier created successfully.',
            'data' => $supplier,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $supplier = Supplier::find($id);

        if (! $supplier) {
            return response()->json([
                'message' => 'Supplier not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Supplier retrieved successfully.',
            'data' => $supplier,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $supplier = Supplier::find($id);

        if (! $supplier) {
            return response()->json([
                'message' => 'Supplier not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:200'],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pincode' => ['sometimes', 'nullable', 'string', 'max:10'],
            'gst_number' => ['sometimes', 'nullable', 'string', 'max:20'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        if (isset($validated['phone'])) {
            $phoneExists = Supplier::where('phone', $validated['phone'])
                ->where('_id', '!=', $supplier->_id)
                ->exists();

            if ($phoneExists) {
                return response()->json([
                    'message' => 'A supplier with this phone number already exists.',
                ], 422);
            }
        }

        if (array_key_exists('email', $validated) && ! empty($validated['email'])) {
            $emailExists = Supplier::where('email', $validated['email'])
                ->where('_id', '!=', $supplier->_id)
                ->exists();

            if ($emailExists) {
                return response()->json([
                    'message' => 'A supplier with this email already exists.',
                ], 422);
            }
        }

        if (
            array_key_exists('gst_number', $validated)
            && ! empty($validated['gst_number'])
        ) {
            $gstExists = Supplier::where(
                'gst_number',
                $validated['gst_number'],
            )
                ->where('_id', '!=', $supplier->_id)
                ->exists();

            if ($gstExists) {
                return response()->json([
                    'message' => 'A supplier with this GST number already exists.',
                ], 422);
            }
        }

        $supplier->update($validated);

        return response()->json([
            'message' => 'Supplier updated successfully.',
            'data' => $supplier->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $supplier = Supplier::find($id);

        if (! $supplier) {
            return response()->json([
                'message' => 'Supplier not found.',
            ], 404);
        }

        $supplierId = (string) $supplier->_id;

        $usedInPurchases = Purchase::where(
            'supplier_id',
            $supplierId,
        )->exists();

        if ($usedInPurchases) {
            return response()->json([
                'message' => 'This supplier cannot be deleted because they are already used in purchases.',
            ], 422);
        }

        $supplier->delete();

        return response()->json([
            'message' => 'Supplier deleted successfully.',
        ]);
    }
}

