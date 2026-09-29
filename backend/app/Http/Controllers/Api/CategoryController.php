<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * List all categories.
     */
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('name')->get();

        return response()->json([
            'message' => 'Categories retrieved successfully.',
            'data' => $categories,
        ]);
    }

    /**
     * Create a category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        $exists = Category::where('slug', $slug)->exists();

        if ($exists) {
            return response()->json([
                'message' => 'A category with this slug already exists.',
            ], 422);
        }

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    /**
     * Show a category.
     */
    public function show(string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Category retrieved successfully.',
            'data' => $category,
        ]);
    }

    /**
     * Update a category.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        if (array_key_exists('name', $validated) && ! array_key_exists('slug', $validated)) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if (isset($validated['slug'])) {
            $slugExists = Category::where('slug', $validated['slug'])
                ->where('_id', '!=', $category->_id)
                ->exists();

            if ($slugExists) {
                return response()->json([
                    'message' => 'A category with this slug already exists.',
                ], 422);
            }
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => $category->fresh(),
        ]);
    }

    /**
     * Delete a category.
     */
    public function destroy(string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}
