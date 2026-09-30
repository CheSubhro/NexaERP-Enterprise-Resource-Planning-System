import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

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

function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <h1 className="text-3xl font-bold">Login</h1>
        </div>
    );
}

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
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
