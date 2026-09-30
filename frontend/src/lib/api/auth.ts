import api from './axios'
import type {
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
  const response = await api.get<{ data: User }>('/auth/user')

  return response.data.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}