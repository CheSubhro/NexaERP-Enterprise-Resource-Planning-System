import { useEffect, useState } from 'react';

import { getDashboard } from '../../lib/api/dashboard';

import type { DashboardData } from '../../types/dashboard';

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function DashboardPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setError('');

                const response = await getDashboard();
                setDashboard(response.data);
            } catch {
                setError('Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-600">
                    {error || 'Dashboard data is unavailable.'}
                </p>
            </div>
        );
    }

    const { summary, recent_sales, recent_purchases, recent_expenses } = dashboard;

    const stats = [
        {
            title: 'Total Sales',
            value: formatCurrency(summary.total_sales),
            description: 'Total sales amount',
        },
        {
            title: 'Total Purchases',
            value: formatCurrency(summary.total_purchase),
            description: 'Total purchase amount',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(summary.total_expenses),
            description: 'Total expenses',
        },
        {
            title: 'Total Products',
            value: summary.total_products.toLocaleString('en-IN'),
            description: 'Products in inventory',
        },
        {
            title: 'Low Stock',
            value: summary.low_stock_products.toLocaleString('en-IN'),
            description: 'Products requiring attention',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

                <p className="mt-1 text-sm text-gray-500">Overview of your business performance</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>

                        <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>

                        <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
                    </div>

                    {recent_sales.length === 0 ? (
                        <div className="p-6 text-sm text-gray-500">No recent sales available.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recent_sales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="flex items-center justify-between px-6 py-4"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {sale.invoice_no}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(sale.sale_date)}
                                        </p>
                                    </div>

                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(sale.total_amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Purchases</h2>
                    </div>

                    {recent_purchases.length === 0 ? (
                        <div className="p-6 text-sm text-gray-500">
                            No recent purchases available.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recent_purchases.map((purchase) => (
                                <div
                                    key={purchase.id}
                                    className="flex items-center justify-between px-6 py-4"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {purchase.invoice_no}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(purchase.purchase_date)}
                                        </p>
                                    </div>

                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(purchase.total_amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
                </div>

                {recent_expenses.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">No recent expenses available.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recent_expenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="flex items-center justify-between px-6 py-4"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {expense.category}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-gray-500">
                                        {expense.description}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {formatDate(expense.expense_date)}
                                    </p>
                                </div>

                                <p className="ml-4 text-sm font-semibold text-gray-900">
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
