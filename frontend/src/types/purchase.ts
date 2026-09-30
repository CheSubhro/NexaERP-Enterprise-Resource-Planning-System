export interface PurchaseItem {
  product_id: string
  quantity: number
  price: number
  subtotal: number
}

export interface Purchase {
  id: string
  invoice_no: string
  supplier_id: string
  items: PurchaseItem[]
  total_amount: number
  purchase_date: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface PurchasesResponse {
  message: string
  data: Purchase[]
}

export interface CreatePurchaseRequest {
  supplier_id: string
  items: PurchaseItem[]
  purchase_date: string
}