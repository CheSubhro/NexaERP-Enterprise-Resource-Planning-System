import type { Expense } from './expense'
import type { Product } from './product'
import type { Purchase } from './purchase'
import type { Sale } from './sale'

export interface SalesReportData {
  total_sales: number
  total_transactions: number
  sales: Sale[]
}

export interface SalesReportResponse {
  message: string
  data: SalesReportData
}

export interface PurchaseReportData {
  total_purchase: number
  total_transactions: number
  purchases: Purchase[]
}

export interface PurchaseReportResponse {
  message: string
  data: PurchaseReportData
}

export interface ExpenseReportData {
  total_expenses: number
  total_transactions: number
  expenses: Expense[]
}

export interface ExpenseReportResponse {
  message: string
  data: ExpenseReportData
}

export interface StockReportData {
  total_products: number
  total_stock_units: number
  low_stock_count: number
  low_stock_products: Product[]
  products: Product[]
}

export interface StockReportResponse {
  message: string
  data: StockReportData
}