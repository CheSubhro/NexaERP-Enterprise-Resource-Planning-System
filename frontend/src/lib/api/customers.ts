import api from './axios'

import type {
  Customer,
  CustomersResponse,
} from '../../types/customer'

export const getCustomers = async (): Promise<CustomersResponse> => {
  const response = await api.get<CustomersResponse>('/customers')

  return response.data
}

export const createCustomer = async (
  data: Omit<
    Customer,
    'id' | 'created_by' | 'created_at' | 'updated_at'
  >,
): Promise<{ message: string; data: Customer }> => {
  const response = await api.post<{
    message: string
    data: Customer
  }>('/customers', data)

  return response.data
}

export const updateCustomer = async (
  id: string,
  data: Partial<Customer>,
): Promise<{ message: string; data: Customer }> => {
  const response = await api.put<{
    message: string
    data: Customer
  }>(`/customers/${id}`, data)

  return response.data
}

export const deleteCustomer = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/customers/${id}`,
  )

  return response.data
}