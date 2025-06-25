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
      calendar_sync: {
        Row: {
          calendar_event_id: string | null
          calendar_provider: string | null
          event_id: string
          id: string
          prep_time_minutes: number | null
          reminder_sent: boolean | null
          synced_at: string
          travel_time_minutes: number | null
          user_id: string
        }
        Insert: {
          calendar_event_id?: string | null
          calendar_provider?: string | null
          event_id: string
          id?: string
          prep_time_minutes?: number | null
          reminder_sent?: boolean | null
          synced_at?: string
          travel_time_minutes?: number | null
          user_id: string
        }
        Update: {
          calendar_event_id?: string | null
          calendar_provider?: string | null
          event_id?: string
          id?: string
          prep_time_minutes?: number | null
          reminder_sent?: boolean | null
          synced_at?: string
          travel_time_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string | null
          is_public: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          community_id: string
          created_at: string
          event_id: string | null
          id: string
          image_url: string | null
          message: string
          message_type: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          message: string
          message_type?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          message?: string
          message_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_polls: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string | null
          event_id: string | null
          expires_at: string | null
          id: string
          title: string
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          title: string
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_polls_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sentiment: {
        Row: {
          created_at: string
          event_id: string
          feedback: string | null
          id: string
          is_anonymous: boolean | null
          sentiment: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          feedback?: string | null
          id?: string
          is_anonymous?: boolean | null
          sentiment?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          feedback?: string | null
          id?: string
          is_anonymous?: boolean | null
          sentiment?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string | null
          category: string
          created_at: string | null
          current_attendees: number | null
          date: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_coordinates: unknown | null
          max_attendees: number | null
          organizer_id: string | null
          price: number
          social_links: Json | null
          tags: string[] | null
          time: string
          title: string
          updated_at: string | null
          venue: string
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string | null
          current_attendees?: number | null
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_coordinates?: unknown | null
          max_attendees?: number | null
          organizer_id?: string | null
          price?: number
          social_links?: Json | null
          tags?: string[] | null
          time: string
          title: string
          updated_at?: string | null
          venue: string
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string | null
          current_attendees?: number | null
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_coordinates?: unknown | null
          max_attendees?: number | null
          organizer_id?: string | null
          price?: number
          social_links?: Json | null
          tags?: string[] | null
          time?: string
          title?: string
          updated_at?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_posters: {
        Row: {
          created_at: string
          dimensions: Json
          event_id: string
          id: string
          image_data: string | null
          image_url: string | null
          prompt: string
          social_platform: string | null
          status: string | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dimensions: Json
          event_id: string
          id?: string
          image_data?: string | null
          image_url?: string | null
          prompt: string
          social_platform?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dimensions?: Json
          event_id?: string
          id?: string
          image_data?: string | null
          image_url?: string | null
          prompt?: string
          social_platform?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_posters_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "poster_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          option_text: string
          poll_id: string
          votes_count: number | null
        }
        Insert: {
          id?: string
          option_text: string
          poll_id: string
          votes_count?: number | null
        }
        Update: {
          id?: string
          option_text?: string
          poll_id?: string
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poster_templates: {
        Row: {
          created_at: string
          description: string | null
          design_data: Json
          dimensions: Json
          id: string
          name: string
          social_platform: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          design_data: Json
          dimensions: Json
          id?: string
          name: string
          social_platform?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          design_data?: Json
          dimensions?: Json
          id?: string
          name?: string
          social_platform?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          is_active: boolean | null
          price_multiplier: number
          rule_type: string
          threshold_value: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          price_multiplier?: number
          rule_type: string
          threshold_value?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          price_multiplier?: number
          rule_type?: string
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          role: string | null
          secondary_email: string | null
          social_links: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          name?: string | null
          role?: string | null
          secondary_email?: string | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          role?: string | null
          secondary_email?: string | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          caption: string
          created_at: string
          error_message: string | null
          event_id: string
          id: string
          platform: string
          post_id: string | null
          posted_at: string | null
          poster_id: string | null
          scheduled_for: string
          status: string | null
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          error_message?: string | null
          event_id: string
          id?: string
          platform: string
          post_id?: string | null
          posted_at?: string | null
          poster_id?: string | null
          scheduled_for: string
          status?: string | null
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          error_message?: string | null
          event_id?: string
          id?: string
          platform?: string
          post_id?: string | null
          posted_at?: string | null
          poster_id?: string | null
          scheduled_for?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "generated_posters"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          event_id: string | null
          id: string
          purchase_date: string | null
          quantity: number
          status: string | null
          total_price: number
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          purchase_date?: string | null
          quantity?: number
          status?: string | null
          total_price: number
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          purchase_date?: string | null
          quantity?: number
          status?: string | null
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_username: {
        Args: { first_name: string }
        Returns: string
      }
      get_dynamic_price: {
        Args: { event_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
