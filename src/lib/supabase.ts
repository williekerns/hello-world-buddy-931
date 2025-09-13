import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aykxmggcrqniznplvkmo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5a3htZ2djcnFuaXpucGx2a21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3OTU2NzMsImV4cCI6MjA1MjM3MTY3M30.hIxtQaH8MKLYxdgXLTLs3mVNYxZ_5fLNy9z0gJq_uw4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  bio: string | null
  avatar_url: string | null
  is_verified: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  seller_id: string
  category_id: string
  title: string
  description: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  starting_price: number
  reserve_price: number | null
  buy_now_price: number | null
  retail_price: number | null
  shipping_cost: number
  weight: number | null
  dimensions: string | null
  created_at: string
  updated_at: string
}

export interface Auction {
  id: string
  item_id: string
  start_time: string
  end_time: string
  current_price: number
  bid_count: number
  status: 'upcoming' | 'active' | 'ended' | 'cancelled'
  mode: 'auction_only' | 'buy_now_only' | 'both'
  created_at: string
  updated_at: string
}

export interface ItemAnalytics {
  id: string
  item_id: string
  view_count: number
  watcher_count: number
  created_at: string
  updated_at: string
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  is_winning: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
}