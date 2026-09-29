<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Permissions
        |--------------------------------------------------------------------------
        */

        $permissions = [
            // Dashboard
            [
                'name' => 'View Dashboard',
                'slug' => 'dashboard.view',
                'module' => 'dashboard',
                'description' => 'View dashboard',
            ],

            // Products
            [
                'name' => 'View Products',
                'slug' => 'products.view',
                'module' => 'products',
            ],
            [
                'name' => 'Create Products',
                'slug' => 'products.create',
                'module' => 'products',
            ],
            [
                'name' => 'Update Products',
                'slug' => 'products.update',
                'module' => 'products',
            ],
            [
                'name' => 'Delete Products',
                'slug' => 'products.delete',
                'module' => 'products',
            ],

            // Customers
            [
                'name' => 'View Customers',
                'slug' => 'customers.view',
                'module' => 'customers',
            ],
            [
                'name' => 'Create Customers',
                'slug' => 'customers.create',
                'module' => 'customers',
            ],
            [
                'name' => 'Update Customers',
                'slug' => 'customers.update',
                'module' => 'customers',
            ],
            [
                'name' => 'Delete Customers',
                'slug' => 'customers.delete',
                'module' => 'customers',
            ],

            // Suppliers
            [
                'name' => 'View Suppliers',
                'slug' => 'suppliers.view',
                'module' => 'suppliers',
            ],
            [
                'name' => 'Create Suppliers',
                'slug' => 'suppliers.create',
                'module' => 'suppliers',
            ],
            [
                'name' => 'Update Suppliers',
                'slug' => 'suppliers.update',
                'module' => 'suppliers',
            ],
            [
                'name' => 'Delete Suppliers',
                'slug' => 'suppliers.delete',
                'module' => 'suppliers',
            ],

            // Sales
            [
                'name' => 'View Sales',
                'slug' => 'sales.view',
                'module' => 'sales',
            ],
            [
                'name' => 'Create Sales',
                'slug' => 'sales.create',
                'module' => 'sales',
            ],
            [
                'name' => 'Update Sales',
                'slug' => 'sales.update',
                'module' => 'sales',
            ],
            [
                'name' => 'Delete Sales',
                'slug' => 'sales.delete',
                'module' => 'sales',
            ],

            // Purchases
            [
                'name' => 'View Purchases',
                'slug' => 'purchases.view',
                'module' => 'purchases',
            ],
            [
                'name' => 'Create Purchases',
                'slug' => 'purchases.create',
                'module' => 'purchases',
            ],
            [
                'name' => 'Update Purchases',
                'slug' => 'purchases.update',
                'module' => 'purchases',
            ],
            [
                'name' => 'Delete Purchases',
                'slug' => 'purchases.delete',
                'module' => 'purchases',
            ],

            // Expenses
            [
                'name' => 'View Expenses',
                'slug' => 'expenses.view',
                'module' => 'expenses',
            ],
            [
                'name' => 'Create Expenses',
                'slug' => 'expenses.create',
                'module' => 'expenses',
            ],
            [
                'name' => 'Update Expenses',
                'slug' => 'expenses.update',
                'module' => 'expenses',
            ],
            [
                'name' => 'Delete Expenses',
                'slug' => 'expenses.delete',
                'module' => 'expenses',
            ],

            // Reports
            [
                'name' => 'View Reports',
                'slug' => 'reports.view',
                'module' => 'reports',
            ],

            // Users
            [
                'name' => 'View Users',
                'slug' => 'users.view',
                'module' => 'users',
            ],
            [
                'name' => 'Create Users',
                'slug' => 'users.create',
                'module' => 'users',
            ],
            [
                'name' => 'Update Users',
                'slug' => 'users.update',
                'module' => 'users',
            ],
            [
                'name' => 'Delete Users',
                'slug' => 'users.delete',
                'module' => 'users',
            ],
            [
                'name' => 'Manage Roles',
                'slug' => 'roles.manage',
                'module' => 'roles',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Create / Update Permissions
        |--------------------------------------------------------------------------
        */

        $permissionIds = [];

        foreach ($permissions as $permissionData) {
            $permission = Permission::updateOrCreate(
                ['slug' => $permissionData['slug']],
                $permissionData
            );

            $permissionIds[$permission->slug] = $permission->_id;
        }

        /*
        |--------------------------------------------------------------------------
        | Admin Role
        |--------------------------------------------------------------------------
        */

        Role::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Admin',
                'description' => 'Full access to the ERP system.',
                'permission_ids' => array_values($permissionIds),
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | User Role
        |--------------------------------------------------------------------------
        */

        $userPermissionSlugs = [
            'dashboard.view',
            'products.view',
            'customers.view',
            'suppliers.view',
            'sales.view',
            'sales.create',
            'purchases.view',
            'purchases.create',
            'expenses.view',
            'expenses.create',
            'reports.view',
        ];

        $userPermissionIds = [];

        foreach ($userPermissionSlugs as $slug) {
            if (isset($permissionIds[$slug])) {
                $userPermissionIds[] = $permissionIds[$slug];
            }
        }

        Role::updateOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'User',
                'description' => 'Standard ERP user.',
                'permission_ids' => $userPermissionIds,
            ]
        );
    }
}