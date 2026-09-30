import api from './axios'

import type {
  CreateSaleRequest,
  Sale,
  SalesResponse,
  UpdateSaleRequest,
} from '../../types/sale'

export const getSales = async (): Promise<SalesResponse> => {
  const response = await api.get<SalesResponse>('/sales')

  return response.data
}

export const createSale = async (
  data: CreateSaleRequest,
): Promise<{ message: string; data: Sale }> => {
  const response = await api.post<{
    message: string
    data: Sale
  }>('/sales', data)

  return response.data
}

export const updateSale = async (
  id: string,
  data: UpdateSaleRequest,
): Promise<{ message: string; data: Sale }> => {
  const response = await api.put<{
    message: string
    data: Sale
  }>(`/sales/${id}`, data)

  return response.data
}

export const deleteSale = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/sales/${id}`,
  )

  return response.data
}