import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

<Route path="/login" element={<LoginPage />} />;

function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">NexaERP Dashboard</h1>
        </div>
    );
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/products" element={<div>Products</div>} />

                <Route path="/categories" element={<div>Categories</div>} />

                <Route path="/customers" element={<div>Customers</div>} />

                <Route path="/suppliers" element={<div>Suppliers</div>} />

                <Route path="/sales" element={<div>Sales</div>} />

                <Route path="/purchases" element={<div>Purchases</div>} />

                <Route path="/expenses" element={<div>Expenses</div>} />

                <Route path="/reports" element={<div>Reports</div>} />

                <Route path="/users" element={<div>Users</div>} />

                <Route path="/roles" element={<div>Roles & Permissions</div>} />

                <Route path="/settings" element={<div>Settings</div>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
