import { useEffect, useMemo, useState } from 'react';

import { createProduct, deleteProduct, getProducts, updateProduct } from '../../lib/api/products';
import { getCategories } from '../../lib/api/categories';

import type { Product, ProductStatus } from '../../types/product';
import type { Category } from '../../types/category';

interface ProductFormData {
    name: string;
    sku: string;
    category_id: string;
    description: string;
    purchase_price: string;
    selling_price: string;
    stock: string;
    low_stock_threshold: string;
    unit: string;
    status: ProductStatus;
}

const initialFormData: ProductFormData = {
    name: '',
    sku: '',
    category_id: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    stock: '0',
    low_stock_threshold: '5',
    unit: 'pcs',
    status: 'active',
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(value);
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = error.response;

        if (typeof response === 'object' && response !== null && 'data' in response) {
            const data = response.data;

            if (
                typeof data === 'object' &&
                data !== null &&
                'message' in data &&
                typeof data.message === 'string'
            ) {
                return data.message;
            }
        }
    }

    return fallback;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [error, setError] = useState('');
    const [categoriesError, setCategoriesError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState<ProductFormData>(initialFormData);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Search / Filter / Pagination
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getProducts();

            setProducts(response.data);
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Failed to load products.'));
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            setCategoriesLoading(true);
            setCategoriesError('');

            const response = await getCategories();

            setCategories(response.data);
        } catch (error: unknown) {
            setCategoriesError(getErrorMessage(error, 'Failed to load categories.'));
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        const initializeProducts = async () => {
            await loadProducts();
        };

        initializeProducts();
    }, []);

    useEffect(() => {
        const initializeCategories = async () => {
            await loadCategories();
        };

        initializeCategories();
    }, []);

    const filteredProducts = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                !searchValue ||
                product.name.toLowerCase().includes(searchValue) ||
                product.sku.toLowerCase().includes(searchValue);

            const matchesCategory = !categoryFilter || product.category_id === categoryFilter;

            const matchesStatus = !statusFilter || product.status === statusFilter;

            const matchesLowStock = !lowStockOnly || product.stock <= product.low_stock_threshold;

            return matchesSearch && matchesCategory && matchesStatus && matchesLowStock;
        });
    }, [products, search, categoryFilter, statusFilter, lowStockOnly]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedProducts = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * itemsPerPage;

        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, safeCurrentPage]);

    const startItem = filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;

    const endItem = Math.min(safeCurrentPage * itemsPerPage, filteredProducts.length);

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((item) => item.id === categoryId);

        return category?.name || 'N/A';
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData(initialFormData);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);

        setFormData({
            name: product.name,
            sku: product.sku,
            category_id: product.category_id,
            description: product.description || '',
            purchase_price: String(product.purchase_price),
            selling_price: String(product.selling_price),
            stock: String(product.stock),
            low_stock_threshold: String(product.low_stock_threshold),
            unit: product.unit || 'pcs',
            status: product.status,
        });

        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingProduct(null);
        setFormData(initialFormData);
    };

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');

            const payload = {
                name: formData.name.trim(),
                sku: formData.sku.trim(),
                category_id: formData.category_id,
                description: formData.description.trim(),
                purchase_price: Number(formData.purchase_price),
                selling_price: Number(formData.selling_price),
                stock: Number(formData.stock),
                low_stock_threshold: Number(formData.low_stock_threshold),
                unit: formData.unit.trim(),
                status: formData.status,
            };

            if (editingProduct) {
                const response = await updateProduct(editingProduct.id, payload);

                setProducts((previous) =>
                    previous.map((product) =>
                        product.id === editingProduct.id ? response.data : product,
                    ),
                );
            } else {
                const response = await createProduct(payload);

                setProducts((previous) => [response.data, ...previous]);
            }

            closeModal();
        } catch (error: unknown) {
            setError(
                getErrorMessage(
                    error,
                    editingProduct ? 'Failed to update product.' : 'Failed to create product.',
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (product: Product) => {
        setDeletingProduct(product);
        setError('');
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setShowDeleteModal(false);
        setDeletingProduct(null);
    };

    const handleDelete = async () => {
        if (!deletingProduct) {
            return;
        }

        try {
            setDeleting(true);
            setError('');

            await deleteProduct(deletingProduct.id);

            setProducts((previous) =>
                previous.filter((product) => product.id !== deletingProduct.id),
            );

            setShowDeleteModal(false);
            setDeletingProduct(null);
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Failed to delete product.'));
        } finally {
            setDeleting(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setStatusFilter('');
        setLowStockOnly(false);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your products and inventory.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    + Add Product
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label
                            htmlFor="product-search"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Search
                        </label>

                        <input
                            id="product-search"
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by product name or SKU..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            htmlFor="category-filter"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Category
                        </label>

                        <select
                            id="category-filter"
                            value={categoryFilter}
                            onChange={(event) => {
                                setCategoryFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Categories</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status-filter"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Status
                        </label>

                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Status</option>

                            <option value="active">Active</option>

                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Low Stock + Clear */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={lowStockOnly}
                            onChange={(event) => {
                                setLowStockOnly(event.target.checked);
                                setCurrentPage(1);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />

                        <span>Show low stock only</span>
                    </label>

                    {(search || categoryFilter || statusFilter || lowStockOnly) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Product
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    SKU
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Category
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Purchase Price
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Selling Price
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Stock
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Status
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 bg-white">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        Loading products...
                                    </td>
                                </tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        {products.length === 0
                                            ? 'No products found.'
                                            : 'No products match the selected filters.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product) => {
                                    const isLowStock = product.stock <= product.low_stock_threshold;

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {product.name}
                                                    </div>

                                                    {product.description && (
                                                        <div className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {product.sku}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {categoriesLoading
                                                    ? 'Loading...'
                                                    : getCategoryName(product.category_id)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {formatCurrency(product.purchase_price)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(product.selling_price)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={
                                                            isLowStock
                                                                ? 'font-semibold text-red-600'
                                                                : 'text-gray-700'
                                                        }
                                                    >
                                                        {product.stock} {product.unit}
                                                    </span>

                                                    {isLowStock && (
                                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                            Low
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={
                                                        product.status === 'active'
                                                            ? 'rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700'
                                                            : 'rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600'
                                                    }
                                                >
                                                    {product.status === 'active'
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(product)}
                                                        className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-100"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(product)}
                                                        className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-700">{startItem}</span>{' '}
                            to <span className="font-medium text-gray-700">{endItem}</span> of{' '}
                            <span className="font-medium text-gray-700">
                                {filteredProducts.length}
                            </span>{' '}
                            products
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={safeCurrentPage === 1}
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="px-2 text-sm text-gray-600">
                                Page {safeCurrentPage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={safeCurrentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingProduct ? 'Edit Product' : 'Add Product'}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {editingProduct
                                        ? 'Update product information.'
                                        : 'Add a new product to your inventory.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Product Name *
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={150}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* SKU */}
                                <div>
                                    <label
                                        htmlFor="sku"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        SKU *
                                    </label>

                                    <input
                                        id="sku"
                                        name="sku"
                                        type="text"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={100}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label
                                        htmlFor="category_id"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Category *
                                    </label>

                                    <select
                                        id="category_id"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">Select Category</option>

                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    {categoriesError && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {categoriesError}
                                        </p>
                                    )}
                                </div>

                                {/* Unit */}
                                <div>
                                    <label
                                        htmlFor="unit"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Unit
                                    </label>

                                    <input
                                        id="unit"
                                        name="unit"
                                        type="text"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        maxLength={50}
                                        placeholder="pcs"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Purchase Price */}
                                <div>
                                    <label
                                        htmlFor="purchase_price"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Purchase Price *
                                    </label>

                                    <input
                                        id="purchase_price"
                                        name="purchase_price"
                                        type="number"
                                        value={formData.purchase_price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Selling Price */}
                                <div>
                                    <label
                                        htmlFor="selling_price"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Selling Price *
                                    </label>

                                    <input
                                        id="selling_price"
                                        name="selling_price"
                                        type="number"
                                        value={formData.selling_price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Stock */}
                                <div>
                                    <label
                                        htmlFor="stock"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Stock
                                    </label>

                                    <input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="1"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Low Stock Threshold */}
                                <div>
                                    <label
                                        htmlFor="low_stock_threshold"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Low Stock Threshold
                                    </label>

                                    <input
                                        id="low_stock_threshold"
                                        name="low_stock_threshold"
                                        type="number"
                                        value={formData.low_stock_threshold}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="1"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="status"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="active">Active</option>

                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    maxLength={1000}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingProduct
                                          ? 'Update Product'
                                          : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
                                !
                            </div>

                            <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-900">
                                    {deletingProduct.name}
                                </span>
                                ?
                            </p>

                            <p className="mt-2 text-xs text-gray-500">
                                This action cannot be undone. Products already used in sales or
                                purchases cannot be deleted.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
