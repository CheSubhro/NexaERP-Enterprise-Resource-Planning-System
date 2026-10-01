
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../hooks/useAuth';

import { getRoleOptions } from '../../lib/api/roles';

import { createUser, deleteUser, getUsers, updateUser } from '../../lib/api/users';

import type { Role } from '../../types/role';

import type { UpdateUserRequest, User } from '../../types/user';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role_id: string;
}

const ITEMS_PER_PAGE = 10;

const createInitialForm = (): UserForm => ({
  name: '',
  email: '',
  password: '',
  role_id: '',
});

function getErrorMessage(error: unknown, fallback: string): string {
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

function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(createInitialForm());
  const [saving, setSaving] = useState(false);

  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const currentUserId = String(currentUser?._id || '');

  const roleMap = useMemo(() => {
    return new Map(roles.map((role) => [String(role._id), role.name]));
  }, [roles]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersResponse, rolesResponse] = await Promise.all([
        getUsers(),
        getRoleOptions(),
      ]);

      setUsers(usersResponse.data);
      setRoles(rolesResponse.data);
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load users.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((user) => {
      const roleName =
        user.role?.name || roleMap.get(user.role_id) || 'Unknown';

      const searchableText = [user.name, user.email, roleName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesRole = !roleFilter || user.role_id === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter, roleMap]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, safeCurrentPage]);

  const startItem =
    filteredUsers.length === 0
      ? 0
      : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    filteredUsers.length,
  );

  const openAddModal = () => {
    setEditingUser(null);
    setForm(createInitialForm());
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id,
    });

    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setForm(createInitialForm());
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter the user name.');
      return;
    }

    if (!form.email.trim()) {
      setError('Please enter the email address.');
      return;
    }

    if (!editingUser && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (editingUser && form.password && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!form.role_id) {
      setError('Please select a role.');
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        const data: UpdateUserRequest = {
          name: form.name.trim(),
          email: form.email.trim(),
          role_id: form.role_id,
        };

        if (form.password) {
          data.password = form.password;
        }

        const response = await updateUser(editingUser._id, data);

        setUsers((current) =>
          current.map((user) =>
            user._id === editingUser._id ? response.data : user,
          ),
        );
      } else {
        const response = await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role_id: form.role_id,
        });

        setUsers((current) => [response.data, ...current]);
        setCurrentPage(1);
      }

      closeModal();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          editingUser
            ? 'Unable to update user.'
            : 'Unable to create user.',
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await deleteUser(deleteUserTarget._id);

      setUsers((current) =>
        current.filter((user) => user._id !== deleteUserTarget._id),
      );

      setDeleteUserTarget(null);
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to delete user.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their roles
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Users</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {users.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Available Roles</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {roles.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label
              htmlFor="user-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="user-search"
              type="text"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name, email or role..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="user-role-filter"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Role
            </label>

            <select
              id="user-role-filter"
              value={roleFilter}
              onChange={(event) =>
                handleRoleFilterChange(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Roles</option>

              {roles.map((role) => {
                const roleId = String(role._id);

                return (
                  <option key={roleId} value={roleId}>
                    {role.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing {startItem} to {endItem} of {filteredUsers.length} users
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Clear Filters
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              disabled={safeCurrentPage === 1}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {users.length === 0
                      ? 'No users found.'
                      : 'No users match the selected filters.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const userId = String(user._id);
                  const isCurrentUser = userId === currentUserId;

                  return (
                    <tr key={userId} className="hover:bg-gray-50">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>

                          {isCurrentUser && (
                            <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {user.email}
                        </p>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {user.role?.name ||
                            roleMap.get(user.role_id) ||
                            'Unknown'}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {formatDate(user.created_at)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          {!isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => setDeleteUserTarget(user)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingUser
                    ? 'Update user information and role'
                    : 'Create a new system user'}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="Enter user name"
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
                  required
                  placeholder="user@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required={!editingUser}
                  placeholder={
                    editingUser
                      ? 'Leave blank to keep current password'
                      : 'Minimum 8 characters'
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {editingUser && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Leave blank if you do not want to change the password.
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role_id"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Role
                </label>

                <select
                  id="role_id"
                  name="role_id"
                  value={form.role_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a role</option>

                  {roles.map((role) => {
                    const roleId = String(role._id);

                    return (
                      <option key={roleId} value={roleId}>
                        {role.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Modal Actions */}
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
                    : editingUser
                      ? 'Update User'
                      : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete User
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete this user?
              </p>
            </div>

            {/* User Details */}
            <div className="space-y-3 px-6 py-5">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {deleteUserTarget.name}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {deleteUserTarget.email}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {deleteUserTarget.role?.name ||
                    roleMap.get(deleteUserTarget.role_id) ||
                    'Unknown role'}
                </p>
              </div>

              <p className="text-xs text-gray-500">
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteUserTarget(null)}
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
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

