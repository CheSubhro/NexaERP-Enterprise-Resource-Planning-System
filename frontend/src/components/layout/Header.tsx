import { useAuth } from '../../context/AuthContext';

function Header() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    <span className="text-blue-600">NexaERP</span>
                    <span className="text-gray-500 font-medium">
                        {' '}
                        Enterprise Resource Planning System
                    </span>
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>

                    <p className="text-xs text-gray-500">{user?.role?.name ?? 'User'}</p>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;
