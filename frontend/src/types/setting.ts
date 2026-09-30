export interface Settings {
  id?: string
  _id?: string

  company_name: string
  logo?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  gst_number?: string | null
  website?: string | null

  invoice_prefix: string
  invoice_footer?: string | null

  currency: string
  currency_symbol: string
  date_format: string
  timezone: string

  default_low_stock_threshold: number

  app_name: string
  app_logo?: string | null

  created_at?: string
  updated_at?: string
}

export interface SettingsResponse {
  message: string
  data: Settings
}

export interface UpdateSettingsRequest {
  company_name?: string
  logo?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  gst_number?: string | null
  website?: string | null

  invoice_prefix?: string
  invoice_footer?: string | null

  currency?: string
  currency_symbol?: string
  date_format?: string
  timezone?: string

  default_low_stock_threshold?: number

  app_name?: string
  app_logo?: string | null
}