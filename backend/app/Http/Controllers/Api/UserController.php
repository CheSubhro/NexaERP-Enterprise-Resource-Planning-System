<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('role')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Users retrieved successfully.',
            'data' => $users,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role_id' => ['required', 'string'],
        ]);

        $role = Role::find($validated['role_id']);

        if (! $role) {
            return response()->json([
                'message' => 'Role not found.',
            ], 404);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role_id' => $validated['role_id'],
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user->load('role'),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with('role')->find($id);

        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'User retrieved successfully.',
            'data' => $user,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($user->_id, '_id'),
            ],
            'password' => ['sometimes', 'required', 'string', 'min:8'],
            'role_id' => ['sometimes', 'required', 'string'],
        ]);

        if (isset($validated['role_id'])) {
            $role = Role::find($validated['role_id']);

            if (! $role) {
                return response()->json([
                    'message' => 'Role not found.',
                ], 404);
            }
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $user->fresh()->load('role'),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        if ((string) $user->_id === (string) $request->user()->_id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}