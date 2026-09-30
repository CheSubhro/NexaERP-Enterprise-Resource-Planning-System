import { NavLink } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

interface NavigationItem {
    name: string;
    path: string;
    permission?: string;
}

const navigation: NavigationItem[] = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        permission: 'dashboard.view',
    },
    {
        name: 'Products',
        path: '/products',
        permission: 'products.view',
    },
    {
        name: 'Categories',
        path: '/categories',
        permission: 'products.view',
    },
    {
        name: 'Customers',
        path: '/customers',
        permission: 'customers.view',
    },
    {
        name: 'Suppliers',
        path: '/suppliers',
        permission: 'suppliers.view',
    },
    {
        name: 'Sales',
        path: '/sales',
        permission: 'sales.view',
    },
    {
        name: 'Purchases',
        path: '/purchases',
        permission: 'purchases.view',
    },
    {
        name: 'Expenses',
        path: '/expenses',
        permission: 'expenses.view',
    },
    {
        name: 'Reports',
        path: '/reports',
        permission: 'reports.view',
    },
    {
        name: 'Users',
        path: '/users',
        permission: 'users.view',
    },
    {
        name: 'Roles & Permissions',
        path: '/roles',
        permission: 'roles.manage',
    },
    {
        name: 'Settings',
        path: '/settings',
        permission: 'settings.manage',
    },
];

function Sidebar() {
    const { user } = useAuth();

    const permissions = user?.role?.permissions?.map((permission) => permission.slug) ?? [];

    const visibleNavigation = navigation.filter((item) => {
        if (!item.permission) {
            return true;
        }

        return permissions.includes(item.permission);
    });

    return (
        <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
                <h1 className="text-2xl font-bold text-gray-900">NexaERP</h1>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {visibleNavigation.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;