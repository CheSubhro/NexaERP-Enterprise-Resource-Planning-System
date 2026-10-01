import { useEffect, useMemo, useState } from 'react';

import { createSale, getSales } from '../../lib/api/sales';
import { getCustomers } from '../../lib/api/customers';
import { getProducts } from '../../lib/api/products';

import type { Customer } from '../../types/customer';
import type { Product } from '../../types/product';
import type { Sale, SaleItem } from '../../types/sale';

interface SaleItemForm {
    product_id: string;
    quantity: number;
    price: number;
}

interface SaleForm {
    customer_id: string;
    sale_date: string;
    items: SaleItemForm[];
}

const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const createEmptyItem = (): SaleItemForm => ({
    product_id: '',
    quantity: 1,
    price: 0,
});

const createInitialForm = (): SaleForm => ({
    customer_id: '',
    sale_date: getToday(),
    items: [createEmptyItem()],
});

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

function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<SaleForm>(createInitialForm());
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    const loadData = async () => {
        try {
            setError('');

            const [salesResponse, customersResponse, productsResponse] = await Promise.all([
                getSales(),
                getCustomers(),
                getProducts(),
            ]);

            setSales(salesResponse.data);
            setCustomers(customersResponse.data);
            setProducts(productsResponse.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Unable to load sales data.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const customerMap = useMemo(() => {
        return new Map(customers.map((customer) => [customer.id, customer]));
    }, [customers]);

    const productMap = useMemo(() => {
        return new Map(products.map((product) => [product.id, product]));
    }, [products]);

    const filteredSales = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return sales.filter((sale) => {
            const customer = customerMap.get(sale.customer_id);

            const customerName = customer?.name ?? '';
            const customerPhone = customer?.phone ?? '';
            const invoiceNumber = sale.invoice_no ?? '';
            const saleDate = sale.sale_date ?? '';

            const matchesSearch =
                !searchValue ||
                invoiceNumber.toLowerCase().includes(searchValue) ||
                customerName.toLowerCase().includes(searchValue) ||
                customerPhone.toLowerCase().includes(searchValue) ||
                sale.customer_id.toLowerCase().includes(searchValue);

            const matchesDate = !dateFilter || saleDate.startsWith(dateFilter);

            return matchesSearch && matchesDate;
        });
    }, [sales, customerMap, search, dateFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage));

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedSales = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * itemsPerPage;

        return filteredSales.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSales, safeCurrentPage]);

    const startItem = filteredSales.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;

    const endItem = Math.min(safeCurrentPage * itemsPerPage, filteredSales.length);

    const hasFilters = search.trim() !== '' || dateFilter !== '';

    const clearFilters = () => {
        setSearch('');
        setDateFilter('');
        setCurrentPage(1);
    };

    const totalAmount = useMemo(() => {
        return form.items.reduce((total, item) => {
            return total + item.quantity * item.price;
        }, 0);
    }, [form.items]);

    const openAddModal = () => {
        setForm(createInitialForm());
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
        setForm(createInitialForm());
    };

    const handleCustomerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setForm((current) => ({
            ...current,
            customer_id: event.target.value,
        }));
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((current) => ({
            ...current,
            sale_date: event.target.value,
        }));
    };

    const handleProductChange = (index: number, productId: string) => {
        const selectedProduct = productMap.get(productId);

        setForm((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          product_id: productId,
                          price: selectedProduct ? selectedProduct.selling_price : 0,
                      }
                    : item,
            ),
        }));
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        setForm((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          quantity: quantity > 0 ? quantity : 1,
                      }
                    : item,
            ),
        }));
    };

    const handlePriceChange = (index: number, price: number) => {
        setForm((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          price: price >= 0 ? price : 0,
                      }
                    : item,
            ),
        }));
    };

    const addItem = () => {
        setForm((current) => ({
            ...current,
            items: [...current.items, createEmptyItem()],
        }));
    };

    const removeItem = (index: number) => {
        if (form.items.length === 1) {
            return;
        }

        setForm((current) => ({
            ...current,
            items: current.items.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.customer_id) {
            setError('Please select a customer.');
            return;
        }

        if (!form.sale_date) {
            setError('Please select a sale date.');
            return;
        }

        if (form.items.length === 0) {
            setError('Please add at least one product.');
            return;
        }

        const hasInvalidItem = form.items.some(
            (item) => !item.product_id || item.quantity <= 0 || item.price < 0,
        );

        if (hasInvalidItem) {
            setError('Please select a product and enter valid quantity and price.');
            return;
        }

        const items: SaleItem[] = form.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price,
        }));

        try {
            setSaving(true);
            setError('');

            const response = await createSale({
                customer_id: form.customer_id,
                sale_date: form.sale_date,
                items,
            });

            setSales((current) => [response.data, ...current]);
            setCurrentPage(1);
            closeModal();
        } catch (error) {
            setError(getErrorMessage(error, 'Unable to create sale.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading sales...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage sales invoices and customer transactions
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    Create Sale
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
                    <div>
                        <label
                            htmlFor="sales-search"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Search
                        </label>

                        <input
                            id="sales-search"
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Invoice, customer name or phone..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="sales-date-filter"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Sale Date
                        </label>

                        <input
                            id="sales-date-filter"
                            type="date"
                            value={dateFilter}
                            onChange={(event) => {
                                setDateFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasFilters}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
                        >
                            Clear Filters
                        </button>
                    </div>
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
                                    Customer
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Items
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Sale Date
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Total
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {paginatedSales.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        {sales.length === 0
                                            ? 'No sales found.'
                                            : 'No sales match the selected filters.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedSales.map((sale) => {
                                    const customer = customerMap.get(sale.customer_id);

                                    return (
                                        <tr key={sale.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {sale.invoice_no}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {customer?.name || sale.customer_id}
                                                </p>

                                                {customer?.phone && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {customer.phone}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700">
                                                    {sale.items.length}{' '}
                                                    {sale.items.length === 1 ? 'item' : 'items'}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700">
                                                    {formatDate(sale.sale_date)}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(sale.total_amount)}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredSales.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {startItem} to {endItem} of {filteredSales.length}{' '}
                            {filteredSales.length === 1 ? 'sale' : 'sales'}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={safeCurrentPage === 1}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="px-2 text-sm text-gray-600">
                                Page {safeCurrentPage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                                }
                                disabled={safeCurrentPage === totalPages}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Create Sale</h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Create a customer sale with one or more products
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg px-2 py-1 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="customer_id"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Customer
                                    </label>

                                    <select
                                        id="customer_id"
                                        value={form.customer_id}
                                        onChange={handleCustomerChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">Select customer</option>

                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                                {customer.phone ? ` - ${customer.phone}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="sale_date"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Sale Date
                                    </label>

                                    <input
                                        id="sale_date"
                                        type="date"
                                        value={form.sale_date}
                                        onChange={handleDateChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Sale Items
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Add products and quantities
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead className="border-b border-gray-200">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Product
                                                </th>

                                                <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Quantity
                                                </th>

                                                <th className="w-40 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Price
                                                </th>

                                                <th className="w-40 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Subtotal
                                                </th>

                                                <th className="w-24 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {form.items.map((item, index) => {
                                                const subtotal = item.quantity * item.price;

                                                return (
                                                    <tr key={`${index}-${item.product_id}`}>
                                                        <td className="px-5 py-4">
                                                            <select
                                                                value={item.product_id}
                                                                onChange={(event) =>
                                                                    handleProductChange(
                                                                        index,
                                                                        event.target.value,
                                                                    )
                                                                }
                                                                required
                                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            >
                                                                <option value="">
                                                                    Select product
                                                                </option>

                                                                {products.map((product) => (
                                                                    <option
                                                                        key={product.id}
                                                                        value={product.id}
                                                                    >
                                                                        {product.name} (
                                                                        {product.sku}) — Stock:{' '}
                                                                        {product.stock}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                value={item.quantity}
                                                                onChange={(event) =>
                                                                    handleQuantityChange(
                                                                        index,
                                                                        Number(event.target.value),
                                                                    )
                                                                }
                                                                required
                                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            />
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.price}
                                                                onChange={(event) =>
                                                                    handlePriceChange(
                                                                        index,
                                                                        Number(event.target.value),
                                                                    )
                                                                }
                                                                required
                                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            />
                                                        </td>

                                                        <td className="px-5 py-4 text-right">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatCurrency(subtotal)}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                disabled={form.items.length === 1}
                                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-4">
                                    <div className="w-full max-w-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-600">
                                                Total Amount
                                            </span>

                                            <span className="text-xl font-bold text-gray-900">
                                                {formatCurrency(totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? 'Creating...' : 'Create Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SalesPage;
