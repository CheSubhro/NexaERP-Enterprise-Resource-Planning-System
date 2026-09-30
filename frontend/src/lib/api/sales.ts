
import api from './axios'

import type {
  CreateSaleRequest,
  Sale,
  SalesResponse,
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

