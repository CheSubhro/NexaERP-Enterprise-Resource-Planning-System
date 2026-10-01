
import { useEffect, useMemo, useState } from 'react';

import {
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
} from '../../lib/api/roles';

import type { Role, RolePermission } from '../../types/role';

interface RoleForm {
  name: string;
  slug: string;
  description: string;
  permission_ids: string[];
}

const ITEMS_PER_PAGE = 10;

const createInitialForm = (): RoleForm => ({
  name: '',
  slug: '',
  description: '',
  permission_ids: [],
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

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleForm>(createInitialForm());
  const [saving, setSaving] = useState(false);

  const [deleteRoleTarget, setDeleteRoleTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, RolePermission[]>();

    permissions.forEach((permission) => {
      const moduleName = permission.module || 'Other';
      const existing = groups.get(moduleName) || [];

      groups.set(moduleName, [...existing, permission]);
    });

    return Array.from(groups.entries()).sort(([moduleA], [moduleB]) =>
      moduleA.localeCompare(moduleB),
    );
  }, [permissions]);

  const moduleOptions = useMemo(() => {
    return permissionGroups.map(([moduleName]) => moduleName);
  }, [permissionGroups]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [rolesResponse, permissionsResponse] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);

      setRoles(rolesResponse.data);
      setPermissions(permissionsResponse.data);
    } catch (error) {
      setError(
        getErrorMessage(error, 'Unable to load roles and permissions.'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRolePermissionModules = (role: Role): string[] => {
    const rolePermissionIds = role.permission_ids || [];

    return Array.from(
      new Set(
        permissions
          .filter((permission) =>
            rolePermissionIds.includes(permission.id),
          )
          .map((permission) => permission.module || 'Other'),
      ),
    );
  };

  const filteredRoles = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return roles.filter((role) => {
      const searchableText = [
        role.name,
        role.slug,
        role.description || '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      if (!moduleFilter) {
        return matchesSearch;
      }

      const rolePermissionIds = role.permission_ids || [];

      const matchesModule = permissions.some(
        (permission) =>
          permission.module === moduleFilter &&
          rolePermissionIds.includes(permission.id),
      );

      return matchesSearch && matchesModule;
    });
  }, [roles, permissions, search, moduleFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRoles.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRoles = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredRoles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRoles, safeCurrentPage]);

  const startItem =
    filteredRoles.length === 0
      ? 0
      : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    filteredRoles.length,
  );

  const openAddModal = () => {
    setEditingRole(null);
    setForm(createInitialForm());
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);

    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permission_ids: role.permission_ids || [],
    });

    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingRole(null);
    setForm(createInitialForm());
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const name = event.target.value;

    setForm((current) => ({
      ...current,
      name,
      slug: editingRole ? current.slug : createSlug(name),
    }));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const togglePermission = (permissionId: string) => {
    setForm((current) => {
      const exists = current.permission_ids.includes(permissionId);

      return {
        ...current,
        permission_ids: exists
          ? current.permission_ids.filter((id) => id !== permissionId)
          : [...current.permission_ids, permissionId],
      };
    });
  };

  const toggleModule = (modulePermissions: RolePermission[]) => {
    const moduleIds = modulePermissions.map(
      (permission) => permission.id,
    );

    const allSelected = moduleIds.every((id) =>
      form.permission_ids.includes(id),
    );

    setForm((current) => ({
      ...current,
      permission_ids: allSelected
        ? current.permission_ids.filter(
            (id) => !moduleIds.includes(id),
          )
        : Array.from(
            new Set([...current.permission_ids, ...moduleIds]),
          ),
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter the role name.');
      return;
    }

    if (!form.slug.trim()) {
      setError('Please enter the role slug.');
      return;
    }

    try {
      setSaving(true);

      if (editingRole) {
        const response = await updateRole(editingRole._id, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
          permission_ids: form.permission_ids,
        });

        setRoles((current) =>
          current.map((role) =>
            role._id === editingRole._id ? response.data : role,
          ),
        );
      } else {
        const response = await createRole({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          permission_ids: form.permission_ids,
        });

        setRoles((current) => [...current, response.data]);
        setCurrentPage(1);
      }

      closeModal();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          editingRole
            ? 'Unable to update role.'
            : 'Unable to create role.',
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRoleTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await deleteRole(deleteRoleTarget._id);

      setRoles((current) =>
        current.filter(
          (role) => role._id !== deleteRoleTarget._id,
        ),
      );

      setDeleteRoleTarget(null);
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to delete role.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleModuleFilterChange = (value: string) => {
    setModuleFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setModuleFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading roles and permissions...
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
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage roles and control system access
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Role
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Roles
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {roles.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Permissions
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {permissions.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label
              htmlFor="role-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="role-search"
              type="text"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              placeholder="Search role name, slug or description..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="role-module-filter"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Permission Module
            </label>

            <select
              id="role-module-filter"
              value={moduleFilter}
              onChange={(event) =>
                handleModuleFilterChange(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Modules</option>

              {moduleOptions.map((moduleName) => (
                <option key={moduleName} value={moduleName}>
                  {moduleName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing {startItem} to {endItem} of {filteredRoles.length}{' '}
            roles
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
                setCurrentPage((page) =>
                  Math.max(1, page - 1),
                )
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
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1),
                )
              }
              disabled={safeCurrentPage === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Slug
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Permissions
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedRoles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {roles.length === 0
                      ? 'No roles found.'
                      : 'No roles match the selected filters.'}
                  </td>
                </tr>
              ) : (
                paginatedRoles.map((role) => (
                  <tr
                    key={role._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {role.name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">
                        {role.slug}
                      </span>
                    </td>

                    <td className="max-w-xs px-6 py-4">
                      <p className="truncate text-sm text-gray-600">
                        {role.description || '—'}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                          {role.permission_ids?.length || 0}{' '}
                          permissions
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(role)}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteRoleTarget(role)
                          }
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingRole ? 'Edit Role' : 'Add Role'}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure role details and permissions
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
              {/* Basic Information */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="role-name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Role Name
                  </label>

                  <input
                    id="role-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleNameChange}
                    maxLength={100}
                    required
                    placeholder="e.g. Manager"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role-slug"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Slug
                  </label>

                  <input
                    id="role-slug"
                    name="slug"
                    type="text"
                    value={form.slug}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    placeholder="manager"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="role-description"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="role-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe this role..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Permissions */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Permissions
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Select the permissions available to this role.
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    {form.permission_ids.length} selected
                  </span>
                </div>

                <div className="space-y-4">
                  {permissionGroups.map(
                    ([moduleName, modulePermissions]) => {
                      const moduleIds = modulePermissions.map(
                        (permission) => permission.id,
                      );

                      const selectedCount = moduleIds.filter((id) =>
                        form.permission_ids.includes(id),
                      ).length;

                      const allSelected =
                        selectedCount === moduleIds.length;

                      return (
                        <div
                          key={moduleName}
                          className="rounded-xl border border-gray-200"
                        >
                          {/* Module Header */}
                          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold capitalize text-gray-900">
                                {moduleName}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-500">
                                {selectedCount}/
                                {modulePermissions.length} selected
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleModule(modulePermissions)
                              }
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              {allSelected
                                ? 'Unselect All'
                                : 'Select All'}
                            </button>
                          </div>

                          {/* Permissions */}
                          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            {modulePermissions.map(
                              (permission) => {
                                const checked =
                                  form.permission_ids.includes(
                                    permission.id,
                                  );

                                return (
                                  <label
                                    key={permission.id}
                                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        togglePermission(
                                          permission.id,
                                        )
                                      }
                                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800">
                                        {permission.name}
                                      </p>

                                      <p className="mt-0.5 truncate font-mono text-[11px] text-gray-400">
                                        {permission.slug}
                                      </p>
                                    </div>
                                  </label>
                                );
                              },
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-white pt-5">
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
                    : editingRole
                      ? 'Update Role'
                      : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteRoleTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Role
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete this role?
              </p>
            </div>

            <div className="space-y-3 px-6 py-5">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {deleteRoleTarget.name}
                </p>

                <p className="mt-1 font-mono text-xs text-gray-500">
                  {deleteRoleTarget.slug}
                </p>
              </div>

              <p className="text-xs text-gray-500">
                If users are assigned to this role, the backend will
                prevent deletion.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteRoleTarget(null)}
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
                {deleting ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

