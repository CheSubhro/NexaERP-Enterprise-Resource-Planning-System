import { useEffect, useState } from 'react';

import {
    createSupplier,
    deleteSupplier,
    getSuppliers,
    updateSupplier,
} from '../../lib/api/suppliers';

import type { Supplier, SupplierStatus } from '../../types/supplier';

interface SupplierForm {
    name: string;
    company_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gst_number: string;
    status: SupplierStatus;
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
};

function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const [form, setForm] = useState<SupplierForm>(initialForm);
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadSuppliers = async () => {
        try {
            setError('');

            const response = await getSuppliers();
            setSuppliers(response.data);
        } catch {
            setError('Unable to load suppliers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const openAddModal = () => {
        setEditingSupplier(null);
        setForm(initialForm);
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);

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
        });

        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
        setEditingSupplier(null);
        setForm(initialForm);
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');

            if (editingSupplier) {
                const response = await updateSupplier(editingSupplier.id, form);

                setSuppliers((current) =>
                    current.map((supplier) =>
                        supplier.id === editingSupplier.id ? response.data : supplier,
                    ),
                );
            } else {
                const response = await createSupplier(form);

                setSuppliers((current) => [response.data, ...current]);
            }

            closeModal();
        } catch (error) {
            const response = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                }
            ).response;

            setError(response?.data?.message || 'Unable to save supplier.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (supplier: Supplier) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${supplier.name}"?`);

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(supplier.id);
            setError('');

            await deleteSupplier(supplier.id);

            setSuppliers((current) => current.filter((item) => item.id !== supplier.id));
        } catch {
            setError('Unable to delete supplier.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading suppliers...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your suppliers and vendor information
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

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Supplier
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Company
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Phone
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Location
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    GST Number
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        No suppliers found.
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {supplier.name}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">
                                                {supplier.company_name}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">
                                                {supplier.phone}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">
                                                {supplier.email || '-'}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">
                                                {supplier.city}, {supplier.state}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {supplier.pincode}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-700">
                                                {supplier.gst_number || '-'}
                                            </p>
                                        </td>

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

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(supplier)}
                                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(supplier)}
                                                    disabled={deletingId === supplier.id}
                                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Enter supplier and company details
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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

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
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
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
        </div>
    );
}

export default SuppliersPage;
