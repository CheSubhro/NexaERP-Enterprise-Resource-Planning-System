import { useEffect, useMemo, useState } from 'react';

import { createExpense, deleteExpense, getExpenses, updateExpense } from '../../lib/api/expenses';

import type { Expense, UpdateExpenseRequest } from '../../types/expense';

interface ExpenseForm {
    category: string;
    amount: number;
    expense_date: string;
    description: string;
}

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const createInitialForm = (): ExpenseForm => ({
    category: '',
    amount: 0,
    expense_date: getToday(),
    description: '',
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

function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const [form, setForm] = useState<ExpenseForm>(createInitialForm());

    const [saving, setSaving] = useState(false);

    const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<Expense | null>(null);

    const [deleting, setDeleting] = useState(false);

    const totalExpenses = useMemo(() => {
        return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
    }, [expenses]);

    const loadExpenses = async () => {
        try {
            setError('');

            const response = await getExpenses();

            setExpenses(response.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Unable to load expenses.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, []);

    const openAddModal = () => {
        setEditingExpense(null);
        setForm(createInitialForm());
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);

        setForm({
            category: expense.category,
            amount: Number(expense.amount),
            expense_date: expense.expense_date ? expense.expense_date.slice(0, 10) : getToday(),
            description: expense.description || '',
        });

        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
        setEditingExpense(null);
        setForm(createInitialForm());
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((current) => ({
            ...current,
            category: event.target.value,
        }));
    };

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);

        setForm((current) => ({
            ...current,
            amount: value >= 0 ? value : 0,
        }));
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((current) => ({
            ...current,
            expense_date: event.target.value,
        }));
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setForm((current) => ({
            ...current,
            description: event.target.value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.category.trim()) {
            setError('Please enter an expense category.');
            return;
        }

        if (form.amount < 0) {
            setError('Amount cannot be negative.');
            return;
        }

        if (!form.expense_date) {
            setError('Please select an expense date.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            if (editingExpense) {
                const data: UpdateExpenseRequest = {
                    category: form.category.trim(),
                    amount: form.amount,
                    expense_date: form.expense_date,
                    description: form.description.trim() || null,
                };

                const response = await updateExpense(editingExpense.id, data);

                setExpenses((current) =>
                    current.map((expense) =>
                        expense.id === editingExpense.id ? response.data : expense,
                    ),
                );
            } else {
                const response = await createExpense({
                    category: form.category.trim(),
                    amount: form.amount,
                    expense_date: form.expense_date,
                    description: form.description.trim() || undefined,
                });

                setExpenses((current) => [response.data, ...current]);
            }

            closeModal();
        } catch (error) {
            setError(
                getErrorMessage(
                    error,
                    editingExpense ? 'Unable to update expense.' : 'Unable to create expense.',
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteExpenseTarget) {
            return;
        }

        try {
            setDeleting(true);
            setError('');

            await deleteExpense(deleteExpenseTarget.id);

            setExpenses((current) =>
                current.filter((expense) => expense.id !== deleteExpenseTarget.id),
            );

            setDeleteExpenseTarget(null);
        } catch (error) {
            setError(getErrorMessage(error, 'Unable to delete expense.'));
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading expenses...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage business expenses and operating costs
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    Add Expense
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total Expenses</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(totalExpenses)}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Expense Entries</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">{expenses.length}</p>
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

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50">
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
                                                {formatCurrency(Number(expense.amount))}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(expense)}
                                                    className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteExpenseTarget(expense)}
                                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingExpense ? 'Edit Expense' : 'Add Expense'}
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    {editingExpense
                                        ? 'Update expense information'
                                        : 'Record a new business expense'}
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

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="category"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Category
                                    </label>

                                    <input
                                        id="category"
                                        type="text"
                                        value={form.category}
                                        onChange={handleCategoryChange}
                                        maxLength={100}
                                        required
                                        placeholder="e.g. Office Supplies"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="amount"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Amount
                                    </label>

                                    <input
                                        id="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={handleAmountChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="expense_date"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Expense Date
                                </label>

                                <input
                                    id="expense_date"
                                    type="date"
                                    value={form.expense_date}
                                    onChange={handleDateChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    value={form.description}
                                    onChange={handleDescriptionChange}
                                    maxLength={500}
                                    rows={4}
                                    placeholder="Enter expense details..."
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
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
                                        : editingExpense
                                          ? 'Update Expense'
                                          : 'Add Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteExpenseTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Delete Expense</h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Are you sure you want to delete this expense?
                            </p>
                        </div>

                        <div className="space-y-3 px-6 py-5">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm font-semibold text-gray-900">
                                    {deleteExpenseTarget.category}
                                </p>

                                <p className="mt-1 text-sm text-gray-600">
                                    {formatCurrency(Number(deleteExpenseTarget.amount))}
                                </p>
                            </div>

                            <p className="text-xs text-gray-500">This action cannot be undone.</p>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setDeleteExpenseTarget(null)}
                                disabled={deleting}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpensesPage;
