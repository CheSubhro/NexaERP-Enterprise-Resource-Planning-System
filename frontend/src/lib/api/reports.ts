import api from './axios'

import type {
  ExpenseReportResponse,
  PurchaseReportResponse,
  SalesReportResponse,
  StockReportResponse,
} from '../../types/report'

export const getSalesReport =
  async (): Promise<SalesReportResponse> => {
    const response =
      await api.get<SalesReportResponse>('/reports/sales')

    return response.data
  }

export const getPurchaseReport =
  async (): Promise<PurchaseReportResponse> => {
    const response =
      await api.get<PurchaseReportResponse>(
        '/reports/purchases',
      )

    return response.data
  }

export const getExpenseReport =
  async (): Promise<ExpenseReportResponse> => {
    const response =
      await api.get<ExpenseReportResponse>(
        '/reports/expenses',
      )

    return response.data
  }

export const getStockReport =
  async (): Promise<StockReportResponse> => {
    const response =
      await api.get<StockReportResponse>('/reports/stock')

    return response.data
  }