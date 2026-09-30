import { NavLink } from 'react-router-dom';

const navigation = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Customers', path: '/customers' },
    { name: 'Suppliers', path: '/suppliers' },
    { name: 'Sales', path: '/sales' },
    { name: 'Purchases', path: '/purchases' },
    { name: 'Expenses', path: '/expenses' },
    { name: 'Reports', path: '/reports' },
    { name: 'Users', path: '/users' },
    { name: 'Roles & Permissions', path: '/roles' },
    { name: 'Settings', path: '/settings' },
];

function Sidebar() {
    return (
        <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
                <h1 className="text-2xl font-bold">
                    <span className="text-indigo-600">Nexa</span>
                    <span className="text-gray-900">ERP</span>
                </h1>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => (
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
