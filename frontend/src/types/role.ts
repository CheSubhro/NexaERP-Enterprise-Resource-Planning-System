export interface RolePermission {
  id?: string
  _id: string
  name: string
  slug: string
  module: string
  description?: string
}

export interface Role {
  id?: string
  _id: string
  name: string
  slug: string
  description: string | null
  permission_ids: string[]
  permissions?: RolePermission[]
}

export interface RolesResponse {
  message: string
  data: Role[]
}