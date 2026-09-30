import api from './axios'

import type {
  Role,
  RolePermission,
  RolesResponse,
} from '../../types/role'

export interface CreateRoleRequest {
  name: string
  slug: string
  description?: string
  permission_ids: string[]
}

export interface UpdateRoleRequest {
  name?: string
  slug?: string
  description?: string | null
  permission_ids?: string[]
}

export interface PermissionsResponse {
  message: string
  data: RolePermission[]
}

export const getRoles = async (): Promise<RolesResponse> => {
  const response = await api.get<RolesResponse>('/roles')

  return response.data
}

export const createRole = async (
  data: CreateRoleRequest,
): Promise<{ message: string; data: Role }> => {
  const response = await api.post<{
    message: string
    data: Role
  }>('/roles', data)

  return response.data
}

export const updateRole = async (
  id: string,
  data: UpdateRoleRequest,
): Promise<{ message: string; data: Role }> => {
  const response = await api.put<{
    message: string
    data: Role
  }>(`/roles/${id}`, data)

  return response.data
}

export const deleteRole = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{
    message: string
  }>(`/roles/${id}`)

  return response.data
}

export const getPermissions =
  async (): Promise<PermissionsResponse> => {
    const response =
      await api.get<PermissionsResponse>(
        '/permissions',
      )

    return response.data
  }