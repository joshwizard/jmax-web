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
      consultation_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      consultation_bookings: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          paid_at: string | null
          payment_ref: string | null
          price_kes: number
          scheduled_at: string
          slot_minutes: number
          status: Database["public"]["Enums"]["booking_status"]
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          payment_ref?: string | null
          price_kes?: number
          scheduled_at: string
          slot_minutes?: number
          status?: Database["public"]["Enums"]["booking_status"]
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          payment_ref?: string | null
          price_kes?: number
          scheduled_at?: string
          slot_minutes?: number
          status?: Database["public"]["Enums"]["booking_status"]
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      consultation_settings: {
        Row: {
          blocked_weekdays: number[]
          id: string
          price_kes: number
          slot_minutes: number
          updated_at: string
          work_end_hour: number
          work_start_hour: number
        }
        Insert: {
          blocked_weekdays?: number[]
          id?: string
          price_kes?: number
          slot_minutes?: number
          updated_at?: string
          work_end_hour?: number
          work_start_hour?: number
        }
        Update: {
          blocked_weekdays?: number[]
          id?: string
          price_kes?: number
          slot_minutes?: number
          updated_at?: string
          work_end_hour?: number
          work_start_hour?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          source?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          source?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          license: string
          order_id: string
          product_id: string | null
          product_slug: string
          qty: number
          title: string
          unit_price_kes: number
        }
        Insert: {
          created_at?: string
          id?: string
          license: string
          order_id: string
          product_id?: string | null
          product_slug: string
          qty?: number
          title: string
          unit_price_kes: number
        }
        Update: {
          created_at?: string
          id?: string
          license?: string
          order_id?: string
          product_id?: string | null
          product_slug?: string
          qty?: number
          title?: string
          unit_price_kes?: number
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
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_kes: number
          id: string
          order_number: string
          paid_at: string | null
          payment_method: string | null
          payment_ref: string | null
          promo_code: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_kes: number
          tax_kes: number
          total_kes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_kes?: number
          id?: string
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          promo_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_kes: number
          tax_kes?: number
          total_kes: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_kes?: number
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          promo_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_kes?: number
          tax_kes?: number
          total_kes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          architectural_price_kes: number | null
          area_sqft: number | null
          bathrooms: number | null
          bedrooms: number | null
          boq_price_kes: number | null
          category: string
          cover_url: string | null
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          is_active: boolean
          price_kes: number
          slug: string
          structural_price_kes: number | null
          title: string
        }
        Insert: {
          architectural_price_kes?: number | null
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          boq_price_kes?: number | null
          category: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean
          price_kes: number
          slug: string
          structural_price_kes?: number | null
          title: string
        }
        Update: {
          architectural_price_kes?: number | null
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          boq_price_kes?: number | null
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean
          price_kes?: number
          slug?: string
          structural_price_kes?: number | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          brief: string | null
          building_type: string | null
          category: string
          challenges: Json
          client: string | null
          cover_url: string | null
          created_at: string
          duration: string | null
          gallery: Json
          id: string
          is_active: boolean
          location: string | null
          outcomes: Json
          scope: Json
          size: string | null
          slug: string
          sort_order: number
          stats: Json
          summary: string | null
          testimonial: Json | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          brief?: string | null
          building_type?: string | null
          category?: string
          challenges?: Json
          client?: string | null
          cover_url?: string | null
          created_at?: string
          duration?: string | null
          gallery?: Json
          id?: string
          is_active?: boolean
          location?: string | null
          outcomes?: Json
          scope?: Json
          size?: string | null
          slug: string
          sort_order?: number
          stats?: Json
          summary?: string | null
          testimonial?: Json | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          brief?: string | null
          building_type?: string | null
          category?: string
          challenges?: Json
          client?: string | null
          cover_url?: string | null
          created_at?: string
          duration?: string | null
          gallery?: Json
          id?: string
          is_active?: boolean
          location?: string | null
          outcomes?: Json
          scope?: Json
          size?: string | null
          slug?: string
          sort_order?: number
          stats?: Json
          summary?: string | null
          testimonial?: Json | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
          title: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating: number
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
          title?: string | null
          user_id?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_slug?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_purchased: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status:
        | "pending"
        | "paid"
        | "confirmed"
        | "cancelled"
        | "completed"
      order_status: "pending" | "paid" | "failed" | "cancelled" | "refunded"
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
    Enums: {
      app_role: ["admin", "user"],
      booking_status: [
        "pending",
        "paid",
        "confirmed",
        "cancelled",
        "completed",
      ],
      order_status: ["pending", "paid", "failed", "cancelled", "refunded"],
    },
  },
} as const
