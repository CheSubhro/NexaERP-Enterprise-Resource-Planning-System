<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Customer::orderBy('name')->get();

        return response()->json([
            'message' => 'Customers retrieved successfully.',
            'data' => $customers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'pincode' => ['nullable', 'string', 'max:10'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $phoneExists = Customer::where('phone', $validated['phone'])->exists();

        if ($phoneExists) {
            return response()->json([
                'message' => 'A customer with this phone number already exists.',
            ], 422);
        }

        if (! empty($validated['email'])) {
            $emailExists = Customer::where('email', $validated['email'])->exists();

            if ($emailExists) {
                return response()->json([
                    'message' => 'A customer with this email already exists.',
                ], 422);
            }
        }

        $customer = Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'pincode' => $validated['pincode'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'created_by' => $request->user()->_id,
        ]);

        return response()->json([
            'message' => 'Customer created successfully.',
            'data' => $customer,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $customer = Customer::find($id);

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Customer retrieved successfully.',
            'data' => $customer,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $customer = Customer::find($id);

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pincode' => ['sometimes', 'nullable', 'string', 'max:10'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        if (isset($validated['phone'])) {
            $phoneExists = Customer::where('phone', $validated['phone'])
                ->where('_id', '!=', $customer->_id)
                ->exists();

            if ($phoneExists) {
                return response()->json([
                    'message' => 'A customer with this phone number already exists.',
                ], 422);
            }
        }

        if (array_key_exists('email', $validated) && ! empty($validated['email'])) {
            $emailExists = Customer::where('email', $validated['email'])
                ->where('_id', '!=', $customer->_id)
                ->exists();

            if ($emailExists) {
                return response()->json([
                    'message' => 'A customer with this email already exists.',
                ], 422);
            }
        }

        $customer->update($validated);

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => $customer->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $customer = Customer::find($id);

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found.',
            ], 404);
        }

        $customerId = (string) $customer->_id;

        $usedInSales = Sale::where('customer_id', $customerId)->exists();

        if ($usedInSales) {
            return response()->json([
                'message' => 'This customer cannot be deleted because they are already used in sales.',
            ], 422);
        }

        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ]);
    }
}

