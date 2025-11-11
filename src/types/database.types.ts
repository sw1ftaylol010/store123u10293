export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          brand: string
          name: string
          description: string | null
          region: string
          category: string
          min_nominal: number
          max_nominal: number
          available_nominals: number[]
          base_price_ratio: number
          discount_percentage: number
          currency: string
          image_url: string | null
          logo_url: string | null
          is_active: boolean
          instructions: string | null
          terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand: string
          name: string
          description?: string | null
          region: string
          category: string
          min_nominal: number
          max_nominal: number
          available_nominals: number[]
          base_price_ratio?: number
          discount_percentage?: number
          currency?: string
          image_url?: string | null
          logo_url?: string | null
          is_active?: boolean
          instructions?: string | null
          terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand?: string
          name?: string
          description?: string | null
          region?: string
          category?: string
          min_nominal?: number
          max_nominal?: number
          available_nominals?: number[]
          base_price_ratio?: number
          discount_percentage?: number
          currency?: string
          image_url?: string | null
          logo_url?: string | null
          is_active?: boolean
          instructions?: string | null
          terms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gift_codes: {
        Row: {
          id: string
          product_id: string
          code: string
          nominal: number
          status: 'available' | 'reserved' | 'sold' | 'invalid'
          order_item_id: string | null
          note: string | null
          created_at: string
          used_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          code: string
          nominal: number
          status?: 'available' | 'reserved' | 'sold' | 'invalid'
          order_item_id?: string | null
          note?: string | null
          created_at?: string
          used_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          code?: string
          nominal?: number
          status?: 'available' | 'reserved' | 'sold' | 'invalid'
          order_item_id?: string | null
          note?: string | null
          created_at?: string
          used_at?: string | null
          expires_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'admin' | 'super_admin'
          preferred_language: string
          preferred_currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          preferred_language?: string
          preferred_currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          preferred_language?: string
          preferred_currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          email: string
          recipient_email: string | null
          recipient_name: string | null
          recipient_message: string | null
          delivery_date: string | null
          total_amount: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_message?: string | null
          delivery_date?: string | null
          total_amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_message?: string | null
          delivery_date?: string | null
          total_amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          nominal: number
          price: number
          discount_percentage: number
          assigned_code_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          nominal: number
          price: number
          discount_percentage?: number
          assigned_code_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          nominal?: number
          price?: number
          discount_percentage?: number
          assigned_code_id?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          provider: string
          bill_id: string | null
          payment_url: string | null
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          amount: number
          currency: string
          commission_amount: number
          raw_response: Json | null
          created_at: string
          updated_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          provider?: string
          bill_id?: string | null
          payment_url?: string | null
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          amount: number
          currency?: string
          commission_amount?: number
          raw_response?: Json | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          provider?: string
          bill_id?: string | null
          payment_url?: string | null
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          amount?: number
          currency?: string
          commission_amount?: number
          raw_response?: Json | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
      }
      events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          event_type: string
          event_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type: string
          event_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type?: string
          event_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      code_status: 'available' | 'reserved' | 'sold' | 'invalid'
      user_role: 'user' | 'admin' | 'super_admin'
    }
  }
}

