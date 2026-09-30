import api from './axios'

import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  User,
} from '../../types/auth'

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    credentials,
  )

  return response.data
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<CurrentUserResponse>(
    '/auth/user',
  )

  const { user, role, permissions } = response.data

  return {
    ...user,
    role: role
      ? {
          ...role,
          permissions,
        }
      : undefined,
  }
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}