export interface DashboardSummary {
  total_sales: number
  total_purchase: number
  total_expenses: number
  total_products: number
  low_stock_products: number
}

export interface DashboardSale {
  invoice_no: string
  customer_id: string
  items: DashboardSaleItem[]
  total_amount: number
  sale_date: string
  created_by: string
  updated_at: string
  created_at: string
  id: string
}

export interface DashboardSaleItem {
  product_id: string
  quantity: number
  price: number
  subtotal: number
}

export interface DashboardPurchase {
  invoice_no: string
  supplier_id: string
  items: DashboardPurchaseItem[]
  total_amount: number
  purchase_date: string
  created_by: string
  updated_at: string
  created_at: string
  id: string
}

export interface DashboardPurchaseItem {
  product_id: string
  quantity: number
  price: number
  subtotal: number
}

export interface DashboardExpense {
  category: string
  amount: number
  expense_date: string
  description: string
  created_by: string
  updated_at: string
  created_at: string
  id: string
}

export interface DashboardData {
  summary: DashboardSummary
  recent_sales: DashboardSale[]
  recent_purchases: DashboardPurchase[]
  recent_expenses: DashboardExpense[]
}

export interface DashboardResponse {
  message: string
  data: DashboardData
}