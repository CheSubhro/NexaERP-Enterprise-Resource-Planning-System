
import { useEffect, useMemo, useState } from 'react'

import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '../../lib/api/suppliers'

import type { Supplier, SupplierStatus } from '../../types/supplier'

interface SupplierForm {
  name: string
  company_name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  gst_number: string
  status: SupplierStatus
}

const initialForm: SupplierForm = {
  name: '',
  company_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gst_number: '',
  status: 'active',
}

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(null)

  const [form, setForm] = useState<SupplierForm>(initialForm)

  const [saving, setSaving] = useState(false)

  const [deleteSupplierTarget, setDeleteSupplierTarget] =
    useState<Supplier | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10

  const loadSuppliers = async () => {
    try {
      setError('')

      const response = await getSuppliers()

      setSuppliers(response.data)
    } catch {
      setError('Unable to load suppliers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const filteredSuppliers = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !searchValue ||
        supplier.name.toLowerCase().includes(searchValue) ||
        supplier.company_name.toLowerCase().includes(searchValue) ||
        supplier.phone.toLowerCase().includes(searchValue) ||
        supplier.email.toLowerCase().includes(searchValue) ||
        supplier.city.toLowerCase().includes(searchValue) ||
        supplier.state.toLowerCase().includes(searchValue) ||
        supplier.gst_number.toLowerCase().includes(searchValue)

      const matchesStatus =
        !statusFilter || supplier.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [suppliers, search, statusFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / itemsPerPage),
  )

  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage

    return filteredSuppliers.slice(
      startIndex,
      startIndex + itemsPerPage,
    )
  }, [filteredSuppliers, safeCurrentPage])

  const startItem =
    filteredSuppliers.length === 0
      ? 0
      : (safeCurrentPage - 1) * itemsPerPage + 1

  const endItem = Math.min(
    safeCurrentPage * itemsPerPage,
    filteredSuppliers.length,
  )

  const openAddModal = () => {
    setEditingSupplier(null)
    setForm(initialForm)
    setError('')
    setIsModalOpen(true)
  }

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier)

    setForm({
      name: supplier.name,
      company_name: supplier.company_name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      pincode: supplier.pincode,
      gst_number: supplier.gst_number,
      status: supplier.status,
    })

    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setIsModalOpen(false)
    setEditingSupplier(null)
    setForm(initialForm)
  }

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        ...form,
        name: form.name.trim(),
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        gst_number: form.gst_number.trim().toUpperCase(),
      }

      if (editingSupplier) {
        const response = await updateSupplier(
          editingSupplier.id,
          payload,
        )

        setSuppliers((current) =>
          current
            .map((supplier) =>
              supplier.id === editingSupplier.id
                ? response.data
                : supplier,
            )
            .sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
        )
      } else {
        const response = await createSupplier(payload)

        setSuppliers((current) =>
          [...current, response.data].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        )
      }

      closeModal()
    } catch (error) {
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
        response?.data?.message ||
          (editingSupplier
            ? 'Unable to update supplier.'
            : 'Unable to create supplier.'),
      )
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (supplier: Supplier) => {
    setError('')
    setDeleteSupplierTarget(supplier)
  }

  const closeDeleteModal = () => {
    if (deletingId) {
      return
    }

    setDeleteSupplierTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteSupplierTarget) {
      return
    }

    try {
      setDeletingId(deleteSupplierTarget.id)
      setError('')

      await deleteSupplier(deleteSupplierTarget.id)

      setSuppliers((current) =>
        current.filter(
          (supplier) =>
            supplier.id !== deleteSupplierTarget.id,
        ),
      )

      setDeleteSupplierTarget(null)
    } catch {
      setError('Unable to delete supplier.')
    } finally {
      setDeletingId(null)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading suppliers...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Suppliers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your suppliers and vendor information.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Supplier
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="md:col-span-2">
            <label
              htmlFor="supplier-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="supplier-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by name, company, phone, email, GST or location..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="supplier-status-filter"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="supplier-status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {filteredSuppliers.length} supplier
            {filteredSuppliers.length !== 1 ? 's' : ''} found
          </p>

          {(search || statusFilter) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Supplier
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Company
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Location
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  GST Number
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
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {suppliers.length === 0
                      ? 'No suppliers found.'
                      : 'No suppliers match the selected filters.'}
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50"
                  >
                    {/* Supplier */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {supplier.name}
                      </p>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {supplier.company_name}
                      </p>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {supplier.phone}
                      </p>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {supplier.email || '—'}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {supplier.city || '—'}
                        {supplier.state
                          ? `, ${supplier.state}`
                          : ''}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {supplier.pincode || '—'}
                      </p>
                    </td>

                    {/* GST */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">
                        {supplier.gst_number || '—'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          supplier.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(supplier)
                          }
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(supplier)
                          }
                          disabled={
                            deletingId === supplier.id
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === supplier.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSuppliers.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-700">
                {startItem}
              </span>{' '}
              to{' '}
              <span className="font-medium text-gray-700">
                {endItem}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-700">
                {filteredSuppliers.length}
              </span>{' '}
              suppliers
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1),
                  )
                }
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
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1),
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingSupplier
                    ? 'Edit Supplier'
                    : 'Add Supplier'}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter supplier and company details.
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

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* Supplier Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Supplier Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label
                    htmlFor="company_name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Company Name
                  </label>

                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    value={form.company_name}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    maxLength={150}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={2}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="state"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label
                    htmlFor="pincode"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label
                    htmlFor="gst_number"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    GST Number
                  </label>

                  <input
                    id="gst_number"
                    name="gst_number"
                    type="text"
                    value={form.gst_number}
                    onChange={handleChange}
                    maxLength={20}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {/* Actions */}
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
                  {saving
                    ? 'Saving...'
                    : editingSupplier
                      ? 'Update Supplier'
                      : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteSupplierTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Supplier
              </h2>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this supplier?
              </p>

              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {deleteSupplierTarget.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {deleteSupplierTarget.company_name}
                </p>
              </div>

              <p className="mt-4 text-xs text-red-500">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={
                  deletingId === deleteSupplierTarget.id
                }
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  deletingId === deleteSupplierTarget.id
                }
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === deleteSupplierTarget.id
                  ? 'Deleting...'
                  : 'Delete Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuppliersPage

