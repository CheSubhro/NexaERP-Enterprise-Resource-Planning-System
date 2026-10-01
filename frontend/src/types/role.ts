
export interface RolePermission {
  id: string
  name: string
  slug: string
  module: string
  description?: string
}

export interface Role {
  _id: string
  id?: string
  name: string
  slug: string
  description?: string
  permission_ids?: string[]
  permissions?: RolePermission[]
}

export interface RolesResponse {
  message: string
  data: Role[]
}

