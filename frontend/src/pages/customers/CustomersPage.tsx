
import { useEffect, useMemo, useState } from 'react';

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../../lib/api/customers';

import type { Customer, CustomerStatus } from '../../types/customer';

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: CustomerStatus;
}

const initialFormData: CustomerFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  status: 'active',
};

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setError('');

        const response = await getCustomers();

        setCustomers(response.data);
      } catch {
        setError('Unable to load customers.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !searchValue ||
        customer.name.toLowerCase().includes(searchValue) ||
        customer.phone.toLowerCase().includes(searchValue) ||
        (customer.email ?? '').toLowerCase().includes(searchValue);

      const matchesStatus =
        !statusFilter || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / itemsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;

    return filteredCustomers.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
  }, [filteredCustomers, safeCurrentPage]);

  const startItem =
    filteredCustomers.length === 0
      ? 0
      : (safeCurrentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    safeCurrentPage * itemsPerPage,
    filteredCustomers.length,
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(initialFormData);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
      address: customer.address ?? '',
      city: customer.city ?? '',
      state: customer.state ?? '',
      pincode: customer.pincode ?? '',
      status: customer.status,
    });

    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        status: formData.status,
      };

      if (editingCustomer) {
        const response = await updateCustomer(
          editingCustomer.id,
          payload,
        );

        setCustomers((current) =>
          current
            .map((customer) =>
              customer.id === editingCustomer.id
                ? response.data
                : customer,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      } else {
        const response = await createCustomer(payload);

        setCustomers((current) =>
          [...current, response.data].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      }

      closeModal();
    } catch {
      setError(
        editingCustomer
          ? 'Unable to update customer.'
          : 'Unable to create customer.',
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (customer: Customer) => {
    setDeletingCustomer(customer);
    setError('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setIsDeleteModalOpen(false);
    setDeletingCustomer(null);
  };

  const handleDelete = async () => {
    if (!deletingCustomer) {
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await deleteCustomer(deletingCustomer.id);

      setCustomers((current) =>
        current.filter(
          (customer) => customer.id !== deletingCustomer.id,
        ),
      );

      closeDeleteModal();
    } catch {
      setError('Unable to delete customer.');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading customers...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your customers and their contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Customer
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
              htmlFor="customer-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, phone or email..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="customer-status-filter"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="customer-status-filter"
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

        {/* Filter Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {filteredCustomers.length} customer
            {filteredCustomers.length !== 1 ? 's' : ''} found
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

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
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
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {customers.length === 0
                      ? 'No customers found.'
                      : 'No customers match the selected filters.'}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {customer.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        PIN: {customer.pincode || '—'}
                      </p>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {customer.phone}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {customer.email || '—'}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {customer.city || '—'}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {customer.state || '—'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(customer)
                          }
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(customer)
                          }
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

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
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
                {filteredCustomers.length}
              </span>{' '}
              customers
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCustomer
                  ? 'Edit Customer'
                  : 'Add Customer'}
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Customer Name
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
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={150}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={formData.city}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={10}
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
                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
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
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingCustomer
                      ? 'Update Customer'
                      : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Customer
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-900">
                  {deletingCustomer.name}
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
                {deleting
                  ? 'Deleting...'
                  : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomersPage;

