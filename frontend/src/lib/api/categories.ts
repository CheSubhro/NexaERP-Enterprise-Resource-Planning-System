import api from './axios'

import type { Category, CategoriesResponse } from '../../types/category'

export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get<CategoriesResponse>('/categories')

  return response.data
}

export const createCategory = async (
  data: Omit<Category, 'id' | 'created_at' | 'updated_at'>,
): Promise<{ message: string; data: Category }> => {
  const response = await api.post<{ message: string; data: Category }>(
    '/categories',
    data,
  )

  return response.data
}

export const updateCategory = async (
  id: string,
  data: Partial<Category>,
): Promise<{ message: string; data: Category }> => {
  const response = await api.put<{ message: string; data: Category }>(
    `/categories/${id}`,
    data,
  )

  return response.data
}

export const deleteCategory = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/categories/${id}`,
  )

  return response.data
}