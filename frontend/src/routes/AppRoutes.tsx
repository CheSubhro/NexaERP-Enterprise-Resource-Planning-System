import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

import LoginPage from '../pages/auth/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProductsPage from '../pages/products/ProductsPage';
import CategoriesPage from '../pages/categories/CategoriesPage';

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

                <Route path="/products" element={<ProductsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
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
