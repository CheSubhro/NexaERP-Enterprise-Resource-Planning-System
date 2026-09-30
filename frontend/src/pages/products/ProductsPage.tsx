import { useEffect, useState } from 'react';

import { getProducts } from '../../lib/api/products';

import type { Product } from '../../types/product';

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(value);
}

function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>

                <p className="mt-1 text-sm text-gray-500">Manage your products and inventory</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Product
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    SKU
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Purchase Price
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Selling Price
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Stock
                                </th>

                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => {
                                const isLowStock = product.stock <= product.low_stock_threshold;

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {product.name}
                                                </p>

                                                <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                    {product.description}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                            {product.sku}
                                        </td>

                                        <td className="px-6 py-4 text-right text-sm text-gray-700">
                                            {formatCurrency(product.purchase_price)}
                                        </td>

                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                            {formatCurrency(product.selling_price)}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <span
                                                className={`text-sm font-semibold ${
                                                    isLowStock ? 'text-red-600' : 'text-gray-900'
                                                }`}
                                            >
                                                {product.stock} {product.unit}
                                            </span>

                                            {isLowStock && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    Low stock
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    product.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {product.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-500">No products found.</div>
                )}
            </div>
        </div>
    );
}

export default ProductsPage;
