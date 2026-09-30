import api from './axios'

import type { ProductsResponse } from '../../types/product'

export const getProducts = async (): Promise<ProductsResponse> => {
  const response = await api.get<ProductsResponse>('/products')

  return response.data
}