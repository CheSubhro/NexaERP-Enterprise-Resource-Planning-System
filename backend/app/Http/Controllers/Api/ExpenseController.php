<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    
    public function index(): JsonResponse
    {
        $expenses = Expense::orderByDesc('expense_date')->get();

        return response()->json([
            'message' => 'Expenses retrieved successfully.',
            'data' => $expenses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $expense = Expense::create([
            'category' => $validated['category'],
            'amount' => $validated['amount'],
            'expense_date' => $validated['expense_date'] ?? now(),
            'description' => $validated['description'] ?? null,
            'created_by' => $request->user()->_id,
        ]);

        return response()->json([
            'message' => 'Expense created successfully.',
            'data' => $expense,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $expense = Expense::find($id);

        if (! $expense) {
            return response()->json([
                'message' => 'Expense not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Expense retrieved successfully.',
            'data' => $expense,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $expense = Expense::find($id);

        if (! $expense) {
            return response()->json([
                'message' => 'Expense not found.',
            ], 404);
        }

        $validated = $request->validate([
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'expense_date' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $expense->update($validated);

        return response()->json([
            'message' => 'Expense updated successfully.',
            'data' => $expense->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $expense = Expense::find($id);

        if (! $expense) {
            return response()->json([
                'message' => 'Expense not found.',
            ], 404);
        }

        $expense->delete();

        return response()->json([
            'message' => 'Expense deleted successfully.',
        ]);
    }
}