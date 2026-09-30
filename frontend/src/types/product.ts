export type ProductStatus = 'active' | 'inactive'

export interface Product {
  id: string
  name: string
  sku: string
  category_id: string
  description: string
  purchase_price: number
  selling_price: number
  stock: number
  low_stock_threshold: number
  unit: string
  status: ProductStatus
  created_by: string
  updated_at: string
  created_at: string
}

export interface ProductsResponse {
  message: string
  data: Product[]
}