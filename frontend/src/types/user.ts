export interface UserRole {
  id?: string
  _id?: string
  name: string
  slug: string
  description?: string
  permission_ids?: string[]
}

export interface User {
  id?: string
  _id: string
  name: string
  email: string
  role_id: string
  role?: UserRole | null
  created_at?: string
  updated_at?: string
}

export interface UsersResponse {
  message: string
  data: User[]
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