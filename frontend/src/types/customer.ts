export type CustomerStatus = 'active' | 'inactive'

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  status: CustomerStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface CustomersResponse {
  message: string
  data: Customer[]
}