export interface SaleItem {
  product_id: string
  quantity: number
  price: number
  subtotal: number
}

export interface Sale {
  id: string
  invoice_no: string
  customer_id: string
  items: SaleItem[]
  total_amount: number
  sale_date: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface SalesResponse {
  message: string
  data: Sale[]
}

export interface CreateSaleRequest {
  customer_id: string
  items: SaleItem[]
  sale_date: string
}

export interface UpdateSaleRequest {
  customer_id?: string
  items?: SaleItem[]
  sale_date?: string
}