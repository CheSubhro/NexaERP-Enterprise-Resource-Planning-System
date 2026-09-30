<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::orderBy('name')->get();

        $roles->each(function ($role) {
            $role->permissions = Permission::whereIn(
                '_id',
                $role->permission_ids ?? []
            )->get();
        });

        return response()->json([
            'message' => 'Roles retrieved successfully.',
            'data' => $roles,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'unique:roles,slug'],
            'description' => ['nullable', 'string', 'max:500'],
            'permission_ids' => ['nullable', 'array'],
            'permission_ids.*' => ['string'],
        ]);

        if (! empty($validated['permission_ids'])) {
            $validPermissionIds = Permission::whereIn(
                '_id',
                $validated['permission_ids']
            )->pluck('_id')->map(fn ($id) => (string) $id)->toArray();

            if (count($validPermissionIds) !== count($validated['permission_ids'])) {
                return response()->json([
                    'message' => 'One or more permission IDs are invalid.',
                ], 422);
            }

            $validated['permission_ids'] = $validPermissionIds;
        } else {
            $validated['permission_ids'] = [];
        }

        $role = Role::create($validated);

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => $role,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $role = Role::find($id);

        if (! $role) {
            return response()->json([
                'message' => 'Role not found.',
            ], 404);
        }

        $role->permissions = Permission::whereIn(
            '_id',
            $role->permission_ids ?? []
        )->get();

        return response()->json([
            'message' => 'Role retrieved successfully.',
            'data' => $role,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $role = Role::find($id);

        if (! $role) {
            return response()->json([
                'message' => 'Role not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('roles', 'slug')->ignore($role->_id, '_id'),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'permission_ids' => ['sometimes', 'nullable', 'array'],
            'permission_ids.*' => ['string'],
        ]);

        if (array_key_exists('permission_ids', $validated)) {
            $permissionIds = $validated['permission_ids'] ?? [];

            $validPermissionIds = Permission::whereIn(
                '_id',
                $permissionIds
            )->pluck('_id')->map(fn ($id) => (string) $id)->toArray();

            if (count($validPermissionIds) !== count($permissionIds)) {
                return response()->json([
                    'message' => 'One or more permission IDs are invalid.',
                ], 422);
            }

            $validated['permission_ids'] = $validPermissionIds;
        }

        $role->update($validated);

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => $role->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $role = Role::find($id);

        if (! $role) {
            return response()->json([
                'message' => 'Role not found.',
            ], 404);
        }

        $usersCount = \App\Models\User::where(
            'role_id',
            $role->_id
        )->count();

        if ($usersCount > 0) {
            return response()->json([
                'message' => 'Role cannot be deleted because it is assigned to users.',
            ], 422);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully.',
        ]);
    }

    public function options(): JsonResponse
    {
        $roles = Role::orderBy('name')
            ->get([
                '_id',
                'name',
                'slug',
            ]);

        return response()->json([
            'message' => 'Role options retrieved successfully.',
            'data' => $roles,
        ]);
    }
    public function permissions(): JsonResponse
    {
        $permissions = Permission::orderBy('module')
            ->orderBy('name')
            ->get();

        return response()->json([
            'message' => 'Permissions retrieved successfully.',
            'data' => $permissions,
        ]);
    }
}