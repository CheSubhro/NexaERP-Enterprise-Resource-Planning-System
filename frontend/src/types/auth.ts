export interface Role {
  _id: string
  name: string
  slug: string
  description?: string
  permission_ids: string[]
}

export interface User {
  _id: string
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