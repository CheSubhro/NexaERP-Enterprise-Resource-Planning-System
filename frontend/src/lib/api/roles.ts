import api from './axios'

import type {
  Role,
  RolesResponse,
} from '../../types/role'

export const getRoles = async (): Promise<RolesResponse> => {
  const response =
    await api.get<RolesResponse>('/roles')

  return response.data
}