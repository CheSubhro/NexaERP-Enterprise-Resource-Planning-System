
import { useEffect, useState, type FormEvent } from 'react'

import {
  deleteProduct,
  getProducts,
  updateProduct,
} from '../../lib/api/products'

import type { Product, ProductStatus } from '../../types/product'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category_id: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    stock: '',
    low_stock_threshold: '',
    unit: '',
    status: 'active' as ProductStatus,
  })

  const loadProducts = async () => {
    try {
      setError('')

      const response = await getProducts()
      setProducts(response.data)
    } catch {
      setError('Unable to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openEditModal = (product: Product) => {
    setError('')
    setEditingProduct(product)

    setForm({
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
    })
  }

  const closeEditModal = () => {
    if (saving) {
      return
    }

    setEditingProduct(null)
  }

  const handleFormChange = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleUpdate = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!editingProduct) {
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await updateProduct(editingProduct.id, {
        name: form.name,
        sku: form.sku,
        category_id: form.category_id,
        description: form.description,
        purchase_price: Number(form.purchase_price),
        selling_price: Number(form.selling_price),
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        unit: form.unit,
        status: form.status,
      })

      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? response.data
            : product,
        ),
      )

      setEditingProduct(null)
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const response = (
          error as {
            response?: {
              data?: {
                message?: string
              }
            }
          }
        ).response

        setError(
          response?.data?.message ??
            'Unable to update product.',
        )
      } else {
        setError('Unable to update product.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProduct) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await deleteProduct(deletingProduct.id)

      setProducts((current) =>
        current.filter(
          (product) => product.id !== deletingProduct.id,
        ),
      )

      setDeletingProduct(null)
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const response = (
          error as {
            response?: {
              data?: {
                message?: string
              }
            }
          }
        ).response

        setError(
          response?.data?.message ??
            'Unable to delete product.',
        )
      } else {
        setError('Unable to delete product.')
      }
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading products...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Products
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your products and inventory
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
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

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const isLowStock =
                  product.stock <= product.low_stock_threshold

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >
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
                          isLowStock
                            ? 'text-red-600'
                            : 'text-gray-900'
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

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(product)
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeletingProduct(product)
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            No products found.
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Product
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update product information
              </p>
            </div>

            <form
              onSubmit={handleUpdate}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="product-name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Product Name
                  </label>

                  <input
                    id="product-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleFormChange(
                        'name',
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-sku"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    SKU
                  </label>

                  <input
                    id="product-sku"
                    type="text"
                    value={form.sku}
                    onChange={(event) =>
                      handleFormChange(
                        'sku',
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-category"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Category ID
                  </label>

                  <input
                    id="product-category"
                    type="text"
                    value={form.category_id}
                    onChange={(event) =>
                      handleFormChange(
                        'category_id',
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-unit"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Unit
                  </label>

                  <input
                    id="product-unit"
                    type="text"
                    value={form.unit}
                    onChange={(event) =>
                      handleFormChange(
                        'unit',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="purchase-price"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Purchase Price
                  </label>

                  <input
                    id="purchase-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.purchase_price}
                    onChange={(event) =>
                      handleFormChange(
                        'purchase_price',
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="selling-price"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Selling Price
                  </label>

                  <input
                    id="selling-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.selling_price}
                    onChange={(event) =>
                      handleFormChange(
                        'selling_price',
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-stock"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Stock
                  </label>

                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) =>
                      handleFormChange(
                        'stock',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="low-stock-threshold"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Low Stock Threshold
                  </label>

                  <input
                    id="low-stock-threshold"
                    type="number"
                    min="0"
                    value={form.low_stock_threshold}
                    onChange={(event) =>
                      handleFormChange(
                        'low_stock_threshold',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="product-status"
                    value={form.status}
                    onChange={(event) =>
                      handleFormChange(
                        'status',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="product-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) =>
                    handleFormChange(
                      'description',
                      event.target.value,
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              Delete Product
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                {deletingProduct.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeletingProduct(null)
                }
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage

