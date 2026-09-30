import api from './axios'

import type { Product, ProductsResponse } from '../../types/product'

export const getProducts = async (): Promise<ProductsResponse> => {
  const response = await api.get<ProductsResponse>('/products')

  return response.data
}

export const updateProduct = async (
  id: string,
  data: Partial<Product>,
): Promise<{ message: string; data: Product }> => {
  const response = await api.put<{ message: string; data: Product }>(
    `/products/${id}`,
    data,
  )

  return response.data
}

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/products/${id}`)

  return response.data
}