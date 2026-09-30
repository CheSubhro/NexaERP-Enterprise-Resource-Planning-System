import { useEffect, useMemo, useState } from 'react';

import {
    getExpenseReport,
    getPurchaseReport,
    getSalesReport,
    getStockReport,
} from '../../lib/api/reports';

import type { Expense } from '../../types/expense';
import type { Product } from '../../types/product';
import type { Purchase } from '../../types/purchase';
import type { Sale } from '../../types/sale';

type ReportTab = 'sales' | 'purchases' | 'expenses' | 'stock';

const reportTabs: {
    key: ReportTab;
    label: string;
}[] = [
    {
        key: 'sales',
        label: 'Sales',
    },
    {
        key: 'purchases',
        label: 'Purchases',
    },
    {
        key: 'expenses',
        label: 'Expenses',
    },
    {
        key: 'stock',
        label: 'Stock',
    },
];

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

function getErrorMessage(error: unknown, fallback: string) {
    const response = (
        error as {
            response?: {
                data?: {
                    message?: string;
                };
            };
        }
    ).response;

    return response?.data?.message || fallback;
}

function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>('sales');

    const [sales, setSales] = useState<Sale[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

    const [totalSales, setTotalSales] = useState(0);
    const [salesTransactions, setSalesTransactions] = useState(0);

    const [totalPurchase, setTotalPurchase] = useState(0);
    const [purchaseTransactions, setPurchaseTransactions] = useState(0);

    const [totalExpenses, setTotalExpenses] = useState(0);
    const [expenseTransactions, setExpenseTransactions] = useState(0);

    const [totalStockUnits, setTotalStockUnits] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadReport = async (tab: ReportTab) => {
        try {
            setLoading(true);
            setError('');

            if (tab === 'sales') {
                const response = await getSalesReport();

                setSales(response.data.sales);
                setTotalSales(Number(response.data.total_sales));
                setSalesTransactions(response.data.total_transactions);
            }

            if (tab === 'purchases') {
                const response = await getPurchaseReport();

                setPurchases(response.data.purchases);
                setTotalPurchase(Number(response.data.total_purchase));
                setPurchaseTransactions(response.data.total_transactions);
            }

            if (tab === 'expenses') {
                const response = await getExpenseReport();

                setExpenses(response.data.expenses);
                setTotalExpenses(Number(response.data.total_expenses));
                setExpenseTransactions(response.data.total_transactions);
            }

            if (tab === 'stock') {
                const response = await getStockReport();

                setProducts(response.data.products);
                setLowStockProducts(response.data.low_stock_products);
                setTotalStockUnits(Number(response.data.total_stock_units));
            }
        } catch (error) {
            setError(getErrorMessage(error, 'Unable to load report.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport(activeTab);
    }, [activeTab]);

    const totalProductValue = useMemo(() => {
        return products.reduce(
            (total, product) => total + Number(product.stock) * Number(product.purchase_price),
            0,
        );
    }, [products]);

    const handleTabChange = (tab: ReportTab) => {
        setActiveTab(tab);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

                <p className="mt-1 text-sm text-gray-500">
                    View sales, purchase, expense and stock reports
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex min-w-max border-b border-gray-200">
                    {reportTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-6 py-3.5 text-sm font-medium transition ${
                                activeTab === tab.key
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-white">
                    <p className="text-sm text-gray-500">Loading report...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'sales' && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Total Sales</p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {formatCurrency(totalSales)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Transactions
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {salesTransactions}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Invoice
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Items
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Sale Date
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {sales.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                                    >
                                                        No sales found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                sales.map((sale) => (
                                                    <tr key={sale.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {sale.invoice_no}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700">
                                                                {sale.items.length}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700">
                                                                {formatDate(sale.sale_date)}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    Number(sale.total_amount),
                                                                )}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'purchases' && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Purchase
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {formatCurrency(totalPurchase)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Transactions
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {purchaseTransactions}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Invoice
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Items
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Purchase Date
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {purchases.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                                    >
                                                        No purchases found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                purchases.map((purchase) => (
                                                    <tr
                                                        key={purchase.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {purchase.invoice_no}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700">
                                                                {purchase.items.length}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700">
                                                                {formatDate(purchase.purchase_date)}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    Number(purchase.total_amount),
                                                                )}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'expenses' && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Expenses
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {formatCurrency(totalExpenses)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Transactions
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {expenseTransactions}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Category
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Description
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Expense Date
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {expenses.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                                    >
                                                        No expenses found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                expenses.map((expense) => (
                                                    <tr
                                                        key={expense.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {expense.category}
                                                            </p>
                                                        </td>

                                                        <td className="max-w-md px-6 py-4">
                                                            <p className="truncate text-sm text-gray-600">
                                                                {expense.description || '—'}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700">
                                                                {formatDate(expense.expense_date)}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    Number(expense.amount),
                                                                )}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'stock' && (
                        <>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Products
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {products.length}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Stock Units
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {totalStockUnits}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Stock Value</p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {formatCurrency(totalProductValue)}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900">
                                                Low Stock Products
                                            </h2>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Products at or below their low-stock threshold
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                            {lowStockProducts.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Product
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    SKU
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Stock
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Threshold
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Unit
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {lowStockProducts.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                                    >
                                                        No low stock products.
                                                    </td>
                                                </tr>
                                            ) : (
                                                lowStockProducts.map((product) => (
                                                    <tr
                                                        key={product.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {product.name}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600">
                                                                {product.sku}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm font-semibold text-red-600">
                                                                {product.stock}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm text-gray-700">
                                                                {product.low_stock_threshold}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm text-gray-700">
                                                                {product.unit}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        All Products Stock
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Product
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    SKU
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Stock
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Threshold
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Purchase Price
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Stock Value
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                                    >
                                                        No products found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map((product) => (
                                                    <tr
                                                        key={product.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {product.name}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600">
                                                                {product.sku}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {product.stock} {product.unit}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm text-gray-700">
                                                                {product.low_stock_threshold}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm text-gray-700">
                                                                {formatCurrency(
                                                                    Number(product.purchase_price),
                                                                )}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    Number(product.stock) *
                                                                        Number(
                                                                            product.purchase_price,
                                                                        ),
                                                                )}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default ReportsPage;
