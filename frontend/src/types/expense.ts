export interface Expense {
  id: string
  category: string
  amount: number
  expense_date: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ExpensesResponse {
  message: string
  data: Expense[]
}

export interface CreateExpenseRequest {
  category: string
  amount: number
  expense_date: string
  description?: string
}

export interface UpdateExpenseRequest {
  category?: string
  amount?: number
  expense_date?: string
  description?: string | null
}