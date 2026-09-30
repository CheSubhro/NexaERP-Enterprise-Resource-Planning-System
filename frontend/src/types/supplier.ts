export type SupplierStatus = 'active' | 'inactive'

export interface Supplier {
  id: string
  name: string
  company_name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  gst_number: string
  status: SupplierStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface SuppliersResponse {
  message: string
  data: Supplier[]
}