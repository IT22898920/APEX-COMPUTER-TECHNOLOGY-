export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'staff' | 'customer'
export type StaffType = 'technician' | 'marketing' | 'support' | null
export type AgreementType = 'comprehensive' | 'labour_only' | 'on_call'
export type AgreementStatus = 'active' | 'expired' | 'cancelled' | 'pending'
export type TicketStatus = 'pending' | 'assigned' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'cancelled'
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'
export type NoteType = 'general' | 'diagnosis' | 'resolution' | 'customer_feedback' | 'internal'
export type InventoryChangeType = 'purchase' | 'sale' | 'repair_use' | 'adjustment' | 'return' | 'damaged'
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'ticket' | 'order'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          staff_type: StaffType
          full_name: string
          phone: string | null
          avatar_url: string | null
          company_name: string | null
          address: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          staff_type?: StaffType
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          company_name?: string | null
          address?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          staff_type?: StaffType
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          company_name?: string | null
          address?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_agreements: {
        Row: {
          id: string
          customer_id: string
          agreement_type: AgreementType
          start_date: string
          end_date: string
          status: AgreementStatus
          monthly_fee: number | null
          response_time_hours: number
          coverage_details: Json | null
          devices_covered: Json[] | null
          terms_conditions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          agreement_type: AgreementType
          start_date: string
          end_date: string
          status?: AgreementStatus
          monthly_fee?: number | null
          response_time_hours?: number
          coverage_details?: Json | null
          devices_covered?: Json[] | null
          terms_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          agreement_type?: AgreementType
          start_date?: string
          end_date?: string
          status?: AgreementStatus
          monthly_fee?: number | null
          response_time_hours?: number
          coverage_details?: Json | null
          devices_covered?: Json[] | null
          terms_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_tickets: {
        Row: {
          id: string
          ticket_number: string
          customer_id: string
          agreement_id: string | null
          assigned_to: string | null
          title: string
          description: string
          device_info: Json | null
          problem_category: string | null
          priority: TicketPriority
          status: TicketStatus
          service_location: Json | null
          is_onsite: boolean
          reported_at: string
          assigned_at: string | null
          started_at: string | null
          resolved_at: string | null
          closed_at: string | null
          sla_deadline: string | null
          sla_breached: boolean
          estimated_cost: number | null
          final_cost: number | null
          is_billable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_number?: string
          customer_id: string
          agreement_id?: string | null
          assigned_to?: string | null
          title: string
          description: string
          device_info?: Json | null
          problem_category?: string | null
          priority?: TicketPriority
          status?: TicketStatus
          service_location?: Json | null
          is_onsite?: boolean
          reported_at?: string
          assigned_at?: string | null
          started_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
          sla_deadline?: string | null
          sla_breached?: boolean
          estimated_cost?: number | null
          final_cost?: number | null
          is_billable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_number?: string
          customer_id?: string
          agreement_id?: string | null
          assigned_to?: string | null
          title?: string
          description?: string
          device_info?: Json | null
          problem_category?: string | null
          priority?: TicketPriority
          status?: TicketStatus
          service_location?: Json | null
          is_onsite?: boolean
          reported_at?: string
          assigned_at?: string | null
          started_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
          sla_deadline?: string | null
          sla_breached?: boolean
          estimated_cost?: number | null
          final_cost?: number | null
          is_billable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ticket_notes: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          note_type: NoteType
          content: string
          attachments: Json[] | null
          is_internal: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          note_type?: NoteType
          content: string
          attachments?: Json[] | null
          is_internal?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string
          note_type?: NoteType
          content?: string
          attachments?: Json[] | null
          is_internal?: boolean
          created_at?: string
        }
      }
      ticket_parts_used: {
        Row: {
          id: string
          ticket_id: string
          product_id: string
          quantity: number
          unit_price: number
          is_billable: boolean
          added_by: string
          added_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          product_id: string
          quantity?: number
          unit_price: number
          is_billable?: boolean
          added_by: string
          added_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          is_billable?: boolean
          added_by?: string
          added_at?: string
        }
      }
      ticket_history: {
        Row: {
          id: string
          ticket_id: string
          changed_by: string
          field_changed: string
          old_value: string | null
          new_value: string | null
          notes: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          changed_by: string
          field_changed: string
          old_value?: string | null
          new_value?: string | null
          notes?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          changed_by?: string
          field_changed?: string
          old_value?: string | null
          new_value?: string | null
          notes?: string | null
          changed_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category_id: string | null
          cost_price: number
          selling_price: number
          stock_quantity: number
          reorder_level: number
          specifications: Json | null
          images: Json[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category_id?: string | null
          cost_price: number
          selling_price: number
          stock_quantity?: number
          reorder_level?: number
          specifications?: Json | null
          images?: Json[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category_id?: string | null
          cost_price?: number
          selling_price?: number
          stock_quantity?: number
          reorder_level?: number
          specifications?: Json | null
          images?: Json[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          status: OrderStatus
          subtotal: number
          tax: number
          discount: number
          total: number
          payment_status: PaymentStatus
          payment_method: string | null
          delivery_address: Json | null
          delivery_notes: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          status?: OrderStatus
          subtotal: number
          tax?: number
          discount?: number
          total: number
          payment_status?: PaymentStatus
          payment_method?: string | null
          delivery_address?: Json | null
          delivery_notes?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          status?: OrderStatus
          subtotal?: number
          tax?: number
          discount?: number
          total?: number
          payment_status?: PaymentStatus
          payment_method?: string | null
          delivery_address?: Json | null
          delivery_notes?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      inventory_logs: {
        Row: {
          id: string
          product_id: string
          change_type: InventoryChangeType
          quantity_change: number
          previous_quantity: number
          new_quantity: number
          reference_type: string | null
          reference_id: string | null
          notes: string | null
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          change_type: InventoryChangeType
          quantity_change: number
          previous_quantity: number
          new_quantity: number
          reference_type?: string | null
          reference_id?: string | null
          notes?: string | null
          performed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          change_type?: InventoryChangeType
          quantity_change?: number
          previous_quantity?: number
          new_quantity?: number
          reference_type?: string | null
          reference_id?: string | null
          notes?: string | null
          performed_by?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          link: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          link?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          link?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_staff_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      staff_type: StaffType
      agreement_type: AgreementType
      agreement_status: AgreementStatus
      ticket_status: TicketStatus
      ticket_priority: TicketPriority
      order_status: OrderStatus
      payment_status: PaymentStatus
      note_type: NoteType
      inventory_change_type: InventoryChangeType
      notification_type: NotificationType
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Profile = Tables<'profiles'>
export type ServiceAgreement = Tables<'service_agreements'>
export type ServiceTicket = Tables<'service_tickets'>
export type TicketNote = Tables<'ticket_notes'>
export type TicketPartUsed = Tables<'ticket_parts_used'>
export type TicketHistory = Tables<'ticket_history'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type InventoryLog = Tables<'inventory_logs'>
export type Notification = Tables<'notifications'>
