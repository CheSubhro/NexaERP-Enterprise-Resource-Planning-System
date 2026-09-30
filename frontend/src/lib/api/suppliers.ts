import api from './axios'

import type {
  Supplier,
  SuppliersResponse,
} from '../../types/supplier'

export const getSuppliers = async (): Promise<SuppliersResponse> => {
  const response = await api.get<SuppliersResponse>('/suppliers')

  return response.data
}

export const createSupplier = async (
  data: Omit<
    Supplier,
    'id' | 'created_by' | 'created_at' | 'updated_at'
  >,
): Promise<{ message: string; data: Supplier }> => {
  const response = await api.post<{
    message: string
    data: Supplier
  }>('/suppliers', data)

  return response.data
}

export const updateSupplier = async (
  id: string,
  data: Partial<Supplier>,
): Promise<{ message: string; data: Supplier }> => {
  const response = await api.put<{
    message: string
    data: Supplier
  }>(`/suppliers/${id}`, data)

  return response.data
}

export const deleteSupplier = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/suppliers/${id}`,
  )

  return response.data
}