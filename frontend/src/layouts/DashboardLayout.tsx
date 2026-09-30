import { Outlet } from 'react-router-dom';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header />

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
