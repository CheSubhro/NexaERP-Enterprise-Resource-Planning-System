import api from './axios'

import type {
  CreatePurchaseRequest,
  Purchase,
  PurchasesResponse,
} from '../../types/purchase'

export const getPurchases = async (): Promise<PurchasesResponse> => {
  const response = await api.get<PurchasesResponse>('/purchases')

  return response.data
}

export const createPurchase = async (
  data: CreatePurchaseRequest,
): Promise<{ message: string; data: Purchase }> => {
  const response = await api.post<{
    message: string
    data: Purchase
  }>('/purchases', data)

  return response.data
}