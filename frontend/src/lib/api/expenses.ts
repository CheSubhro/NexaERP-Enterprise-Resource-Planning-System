import api from './axios'

import type {
  CreateExpenseRequest,
  Expense,
  ExpensesResponse,
  UpdateExpenseRequest,
} from '../../types/expense'

export const getExpenses = async (): Promise<ExpensesResponse> => {
  const response = await api.get<ExpensesResponse>('/expenses')

  return response.data
}

export const createExpense = async (
  data: CreateExpenseRequest,
): Promise<{ message: string; data: Expense }> => {
  const response = await api.post<{
    message: string
    data: Expense
  }>('/expenses', data)

  return response.data
}

export const updateExpense = async (
  id: string,
  data: UpdateExpenseRequest,
): Promise<{ message: string; data: Expense }> => {
  const response = await api.put<{
    message: string
    data: Expense
  }>(`/expenses/${id}`, data)

  return response.data
}

export const deleteExpense = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/expenses/${id}`,
  )

  return response.data
}