<?php

namespace App\Http\Middleware;

use App\Models\Permission;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(
        Request $request,
        Closure $next,
        string $permission
    ): Response {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $role = $user->role;

        if (! $role) {
            return response()->json([
                'message' => 'Access denied. No role assigned.',
            ], 403);
        }

        $permissionIds = $role->permission_ids ?? [];

        $hasPermission = Permission::whereIn('_id', $permissionIds)
            ->where('slug', $permission)
            ->exists();

        if (! $hasPermission) {
            return response()->json([
                'message' => 'Access denied.',
                'required_permission' => $permission,
            ], 403);
        }

        return $next($request);
    }
}