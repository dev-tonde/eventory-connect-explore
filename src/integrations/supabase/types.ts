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
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      email_notifications: {
        Row: {
          content: string
          created_at: string | null
          email_type: string
          error_message: string | null
          event_id: string | null
          id: string
          recipient_email: string
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          email_type: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          recipient_email: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          recipient_email?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string | null
          error_message: string
          error_type: string
          id: string
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message: string
          error_type: string
          id?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string
          error_type?: string
          id?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_analytics: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          ip_address: unknown | null
          metric_type: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          ip_address?: unknown | null
          metric_type: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          ip_address?: unknown | null
          metric_type?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_approvals: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          created_at: string | null
          event_id: string | null
          id: string
          reviewed_at: string | null
          status: string | null
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string | null
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_approvals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reviews: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          is_verified_attendee: boolean | null
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_verified_attendee?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_verified_attendee?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      event_waitlist: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          notified: boolean | null
          position: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          notified?: boolean | null
          position: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          notified?: boolean | null
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_waitlist_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      file_uploads: {
        Row: {
          created_at: string | null
          file_size: number
          id: string
          mime_type: string
          original_filename: string
          scan_result: Json | null
          scan_status: string | null
          stored_filename: string
          upload_path: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_size: number
          id?: string
          mime_type: string
          original_filename: string
          scan_result?: Json | null
          scan_status?: string | null
          stored_filename: string
          upload_path: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number
          id?: string
          mime_type?: string
          original_filename?: string
          scan_result?: Json | null
          scan_status?: string | null
          stored_filename?: string
          upload_path?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_rate_limits: {
        Row: {
          created_at: string | null
          form_type: string
          id: string
          identifier: string
          submission_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          form_type: string
          id?: string
          identifier: string
          submission_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          form_type?: string
          id?: string
          identifier?: string
          submission_count?: number | null
          window_start?: string | null
        }
        Relationships: []
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
      location_cache: {
        Row: {
          address: string
          cached_at: string | null
          city: string | null
          country: string | null
          id: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          address: string
          cached_at?: string | null
          city?: string | null
          country?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          address?: string
          cached_at?: string | null
          city?: string | null
          country?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          genre: string
          id: string
          is_active: boolean
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          genre: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          genre?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
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
          max_price: number | null
          min_price: number | null
          price_multiplier: number
          priority: number | null
          rule_type: string
          threshold_value: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          price_multiplier?: number
          priority?: number | null
          rule_type: string
          threshold_value?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          price_multiplier?: number
          priority?: number | null
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      qr_scan_logs: {
        Row: {
          device_info: Json | null
          event_id: string
          id: string
          scan_location: string | null
          scanned_at: string
          scanned_by: string
          ticket_id: string
        }
        Insert: {
          device_info?: Json | null
          event_id: string
          id?: string
          scan_location?: string | null
          scanned_at?: string
          scanned_by: string
          ticket_id: string
        }
        Update: {
          device_info?: Json | null
          event_id?: string
          id?: string
          scan_location?: string | null
          scanned_at?: string
          scanned_by?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_scan_logs_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_scan_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          count: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          processed_at: string | null
          reason: string
          refund_amount: number
          status: string | null
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          reason: string
          refund_amount: number
          status?: string | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          reason?: string
          refund_amount?: number
          status?: string | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
      social_posts: {
        Row: {
          caption: string
          community_id: string | null
          created_at: string
          event_id: string | null
          external_post_id: string | null
          id: string
          image_url: string | null
          platform: string
          posted_at: string
          poster_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          caption: string
          community_id?: string | null
          created_at?: string
          event_id?: string | null
          external_post_id?: string | null
          id?: string
          image_url?: string | null
          platform: string
          posted_at?: string
          poster_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          caption?: string
          community_id?: string | null
          created_at?: string
          event_id?: string | null
          external_post_id?: string | null
          id?: string
          image_url?: string | null
          platform?: string
          posted_at?: string
          poster_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "generated_posters"
            referencedColumns: ["id"]
          },
        ]
      }
      split_payment_participants: {
        Row: {
          amount: number
          created_at: string | null
          email: string
          id: string
          paid_at: string | null
          payment_method: string | null
          split_payment_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          email: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          split_payment_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          email?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          split_payment_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_payment_participants_split_payment_id_fkey"
            columns: ["split_payment_id"]
            isOneToOne: false
            referencedRelation: "split_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      split_payments: {
        Row: {
          created_at: string | null
          event_id: string
          expires_at: string | null
          id: string
          organizer_id: string
          quantity: number
          status: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          event_id: string
          expires_at?: string | null
          id?: string
          organizer_id: string
          quantity?: number
          status?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          event_id?: string
          expires_at?: string | null
          id?: string
          organizer_id?: string
          quantity?: number
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "split_payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          event_id: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          purchase_date: string | null
          qr_code: string | null
          qr_scanned_at: string | null
          quantity: number
          scanned_by: string | null
          status: string | null
          ticket_number: string | null
          total_price: number
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          purchase_date?: string | null
          qr_code?: string | null
          qr_scanned_at?: string | null
          quantity?: number
          scanned_by?: string | null
          status?: string | null
          ticket_number?: string | null
          total_price: number
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          purchase_date?: string | null
          qr_code?: string | null
          qr_scanned_at?: string | null
          quantity?: number
          scanned_by?: string | null
          status?: string | null
          ticket_number?: string | null
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
            foreignKeyName: "tickets_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
          secret: string
          user_id: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret: string
          user_id?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_2fa_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          badges: string[] | null
          created_at: string | null
          id: string
          last_activity: string | null
          level: number | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges?: string[] | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          level?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges?: string[] | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          level?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          event_id: string | null
          id: string
          report_type: string
          reported_user_id: string | null
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          event_id?: string | null
          id?: string
          report_type: string
          reported_user_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          event_id?: string | null
          id?: string
          report_type?: string
          reported_user_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
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
      cache_location: {
        Args: {
          _address: string
          _latitude: number
          _longitude: number
          _city?: string
          _country?: string
        }
        Returns: undefined
      }
      check_form_rate_limit: {
        Args: {
          identifier_val: string
          form_type_val: string
          max_submissions?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          identifier_val: string
          action_val: string
          max_requests: number
          window_minutes?: number
        }
        Returns: boolean
      }
      create_split_payment: {
        Args: {
          _event_id: string
          _total_amount: number
          _quantity: number
          _participant_emails: string[]
        }
        Returns: string
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_username: {
        Args: { first_name: string }
        Returns: string
      }
      get_cached_location: {
        Args: { _address: string }
        Returns: {
          latitude: number
          longitude: number
          city: string
          country: string
        }[]
      }
      get_dynamic_price: {
        Args: { event_uuid: string }
        Returns: number
      }
      get_dynamic_price_with_constraints: {
        Args: { event_uuid: string }
        Returns: number
      }
      get_event_rating: {
        Args: { event_uuid: string }
        Returns: number
      }
      log_admin_action: {
        Args: {
          action_val: string
          resource_type_val: string
          resource_id_val?: string
          details_val?: Json
        }
        Returns: string
      }
      process_qr_scan: {
        Args: {
          p_ticket_id: string
          p_scanner_id: string
          p_scan_location?: string
          p_device_info?: Json
        }
        Returns: Json
      }
      process_split_payment_contribution: {
        Args: {
          _split_id: string
          _participant_email: string
          _payment_method?: string
        }
        Returns: boolean
      }
      track_event_view: {
        Args: { event_uuid: string; session_id?: string }
        Returns: undefined
      }
      update_user_points: {
        Args: { p_user_id: string; p_points: number }
        Returns: undefined
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
