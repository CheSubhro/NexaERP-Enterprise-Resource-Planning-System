export type CategoryStatus = 'active' | 'inactive'

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  status: CategoryStatus
  created_at: string
  updated_at: string
}

export interface CategoriesResponse {
  message: string
  data: Category[]
}