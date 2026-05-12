export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_at: string
          banned_by: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image: string | null
          published_at: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image?: string | null
          published_at?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image?: string | null
          published_at?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          image?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
          replied_at: string | null
          subject: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
          replied_at?: string | null
          subject: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
          replied_at?: string | null
          subject?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant_image: string | null
          variant_option: string | null
          variant_value: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant_image?: string | null
          variant_option?: string | null
          variant_value?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          variant_image?: string | null
          variant_option?: string | null
          variant_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string
          created_at: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          discreet_packaging: boolean
          estimated_delivery: string | null
          id: string
          notes: string | null
          payment_reference: string | null
          payment_status: string
          shipped_at: string | null
          shipping_cost_cny: number
          shipping_cost_ghs: number
          shipping_method: string | null
          shipping_option_id: string | null
          shipping_payment_reference: string | null
          shipping_payment_status: string | null
          status: string
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city?: string
          created_at?: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          discreet_packaging?: boolean
          estimated_delivery?: string | null
          id: string
          notes?: string | null
          payment_reference?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_cost_cny?: number
          shipping_cost_ghs?: number
          shipping_method?: string | null
          shipping_option_id?: string | null
          shipping_payment_reference?: string | null
          shipping_payment_status?: string | null
          status?: string
          total: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          discreet_packaging?: boolean
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          payment_reference?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_cost_cny?: number
          shipping_cost_ghs?: number
          shipping_method?: string | null
          shipping_option_id?: string | null
          shipping_payment_reference?: string | null
          shipping_payment_status?: string | null
          status?: string
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_option_id_fkey"
            columns: ["shipping_option_id"]
            isOneToOne: false
            referencedRelation: "shipping_options"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          exchange_rate_cny_to_ghs: number
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          exchange_rate_cny_to_ghs?: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          exchange_rate_cny_to_ghs?: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          image: string | null
          in_stock: boolean | null
          name: string
          price_cny: number | null
          price_ghs: number | null
          product_id: string | null
          sort_order: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          name: string
          price_cny?: number | null
          price_ghs?: number | null
          product_id?: string | null
          sort_order?: number | null
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          name?: string
          price_cny?: number | null
          price_ghs?: number | null
          product_id?: string | null
          sort_order?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability_status: string
          benefits: string | null
          category_id: string | null
          compare_price_ghs: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          in_stock: boolean
          is_featured: boolean
          material: string | null
          name: string
          price_cny: number
          price_ghs: number
          product_link: string | null
          rating: number
          review_count: number
          slug: string
          updated_at: string
          usage_guide: string | null
        }
        Insert: {
          availability_status?: string
          benefits?: string | null
          category_id?: string | null
          compare_price_ghs?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean
          is_featured?: boolean
          material?: string | null
          name: string
          price_cny?: number
          price_ghs: number
          product_link?: string | null
          rating?: number
          review_count?: number
          slug: string
          updated_at?: string
          usage_guide?: string | null
        }
        Update: {
          availability_status?: string
          benefits?: string | null
          category_id?: string | null
          compare_price_ghs?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean
          is_featured?: boolean
          material?: string | null
          name?: string
          price_cny?: number
          price_ghs?: number
          product_link?: string | null
          rating?: number
          review_count?: number
          slug?: string
          updated_at?: string
          usage_guide?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          email_notifications: boolean
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_notifications?: boolean
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_notifications?: boolean
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_reply: string | null
          approved: boolean
          content: string | null
          created_at: string
          customer_name: string
          id: string
          product_id: string
          rating: number
          replied_at: string | null
        }
        Insert: {
          admin_reply?: string | null
          approved?: boolean
          content?: string | null
          created_at?: string
          customer_name: string
          id?: string
          product_id: string
          rating: number
          replied_at?: string | null
        }
        Update: {
          admin_reply?: string | null
          approved?: boolean
          content?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          product_id?: string
          rating?: number
          replied_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_options: {
        Row: {
          created_at: string
          delivery_max_days: number
          delivery_min_days: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_cny: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_max_days: number
          delivery_min_days: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_cny?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_max_days?: number
          delivery_min_days?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_cny?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      monthly_stats: {
        Row: {
          avg_delivery_days: number | null
          cancelled_orders: number | null
          delivered_orders: number | null
          month: string | null
          revenue_ghs: number | null
          total_orders: number | null
        }
        Relationships: []
      }
      sales_summary: {
        Row: {
          cumulative_revenue: number | null
          order_count: number | null
          revenue_ghs: number | null
          sale_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_order_id: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
