import api from './axios'

import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UsersResponse,
} from '../../types/user'

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await api.get<UsersResponse>('/users')

  return response.data
}

export const createUser = async (
  data: CreateUserRequest,
): Promise<{ message: string; data: User }> => {
  const response = await api.post<{
    message: string
    data: User
  }>('/users', data)

  return response.data
}

export const updateUser = async (
  id: string,
  data: UpdateUserRequest,
): Promise<{ message: string; data: User }> => {
  const response = await api.put<{
    message: string
    data: User
  }>(`/users/${id}`, data)

  return response.data
}

export const deleteUser = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{
    message: string
  }>(`/users/${id}`)

  return response.data
}