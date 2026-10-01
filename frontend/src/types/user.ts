
import type { Role } from './role'

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  role_id: string
  role?: Role
  created_at?: string
  updated_at?: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role_id: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  role_id?: string
}

export interface UsersResponse {
  message: string
  data: User[]
}

