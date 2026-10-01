
export interface Permission {
  name: string
  slug: string
  module: string
}

export interface Role {
  _id?: string
  id?: string
  name: string
  slug: string
  description?: string
  permission_ids?: string[]
  permissions?: Permission[]
}

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

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface CurrentUserResponse {
  user: User
  role: Role | null
  permissions: Permission[]
}

