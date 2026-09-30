import { useEffect, useState } from 'react';

import { getCategories } from '../../lib/api/categories';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../lib/api/products';

import type { Category } from '../../types/category';
import type { Product, ProductStatus } from '../../types/product';

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

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(value);
}

function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [error, setError] = useState('');
    const [categoriesError, setCategoriesError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState<ProductFormData>(initialFormData);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setError('');

                const response = await getProducts();

                setProducts(response.data);
            } catch {
                setError('Unable to load products.');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesError('');

                const response = await getCategories();

                setCategories(response.data);
            } catch {
                setCategoriesError('Unable to load categories.');
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData(initialFormData);
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);

        setFormData({
            name: product.name,
            sku: product.sku,
            category_id: product.category_id,
            description: product.description ?? '',
            purchase_price: String(product.purchase_price),
            selling_price: String(product.selling_price),
            stock: String(product.stock),
            low_stock_threshold: String(product.low_stock_threshold),
            unit: product.unit,
            status: product.status,
        });

        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData(initialFormData);
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formData.category_id) {
            setError('Please select a category.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const payload = {
                name: formData.name,
                sku: formData.sku,
                category_id: formData.category_id,
                description: formData.description,
                purchase_price: Number(formData.purchase_price),
                selling_price: Number(formData.selling_price),
                stock: Number(formData.stock),
                low_stock_threshold: Number(formData.low_stock_threshold),
                unit: formData.unit,
                status: formData.status,
            };

            if (editingProduct) {
                const response = await updateProduct(editingProduct.id, payload);

                setProducts((current) =>
                    current.map((product) =>
                        product.id === editingProduct.id ? response.data : product,
                    ),
                );
            } else {
                const response = await createProduct(payload);

                setProducts((current) =>
                    [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)),
                );
            }

            closeModal();
        } catch {
            setError(editingProduct ? 'Unable to update product.' : 'Unable to create product.');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (product: Product) => {
        setDeletingProduct(product);
        setError('');
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setIsDeleteModalOpen(false);
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

            setProducts((current) =>
                current.filter((product) => product.id !== deletingProduct.id),
            );

            closeDeleteModal();
        } catch {
            setError('Unable to delete product.');
        } finally {
            setDeleting(false);
        }
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((item) => item.id === categoryId);

        return category?.name ?? 'Unknown Category';
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                    Add Product
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}

            {/* Category loading/error */}
            {categoriesError && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                    <p className="text-sm font-medium text-yellow-700">{categoriesError}</p>
                </div>
            )}

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

                        <tbody className="divide-y divide-gray-100 bg-white">
                            {products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {product.name}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {product.unit}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {product.sku}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {getCategoryName(product.category_id)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatCurrency(product.purchase_price)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatCurrency(product.selling_price)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={
                                                    product.stock <= product.low_stock_threshold
                                                        ? 'font-semibold text-red-600'
                                                        : 'text-gray-700'
                                                }
                                            >
                                                {product.stock}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    product.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {product.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(product)}
                                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteModal(product)}
                                                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Product Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Product Name
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
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
                                        SKU
                                    </label>

                                    <input
                                        id="sku"
                                        name="sku"
                                        type="text"
                                        value={formData.sku}
                                        onChange={handleChange}
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
                                        Category
                                    </label>

                                    <select
                                        id="category_id"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        required
                                        disabled={categoriesLoading}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {categoriesLoading
                                                ? 'Loading categories...'
                                                : 'Select category'}
                                        </option>

                                        {categories
                                            .filter((category) => category.status === 'active')
                                            .map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                    </select>
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
                                        onChange={handleChange}
                                        maxLength={50}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Purchase Price */}
                                <div>
                                    <label
                                        htmlFor="purchase_price"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Purchase Price
                                    </label>

                                    <input
                                        id="purchase_price"
                                        name="purchase_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.purchase_price}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Selling Price */}
                                <div>
                                    <label
                                        htmlFor="selling_price"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Selling Price
                                    </label>

                                    <input
                                        id="selling_price"
                                        name="selling_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.selling_price}
                                        onChange={handleChange}
                                        required
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
                                        min="0"
                                        step="1"
                                        value={formData.stock}
                                        onChange={handleChange}
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
                                        min="0"
                                        step="1"
                                        value={formData.low_stock_threshold}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Status */}
                                <div>
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
                                        onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    disabled={saving || categoriesLoading}
                                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            {isDeleteModalOpen && deletingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-900">
                                    {deletingProduct.name}
                                </span>
                                ?
                            </p>

                            <p className="mt-2 text-xs text-gray-500">
                                This action cannot be undone.
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

export default ProductsPage;
