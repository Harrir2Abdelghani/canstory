export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'patient' | 'doctor' | 'pharmacy' | 'association' | 'cancer_center' | 'laboratory' | 'admin'
export type CancerType = 'breast' | 'lung' | 'colon' | 'prostate' | 'uterus' | 'other'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type NotificationType = 'article' | 'appointment' | 'message' | 'system' | 'community'
export type LanguagePreference = 'ar' | 'fr' | 'en'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          phone: string | null
          wilaya: string
          commune: string
          language: LanguagePreference
          avatar_url: string | null
          is_active: boolean
          email_verified: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          phone?: string | null
          wilaya: string
          commune: string
          language?: LanguagePreference
          avatar_url?: string | null
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          phone?: string | null
          wilaya?: string
          commune?: string
          language?: LanguagePreference
          avatar_url?: string | null
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          specialization: string | null
          license_number: string | null
          address: string | null
          working_hours: Json | null
          services: Json | null
          website: string | null
          social_links: Json | null
          verification_status: string
          verified_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          specialization?: string | null
          license_number?: string | null
          address?: string | null
          working_hours?: Json | null
          services?: Json | null
          website?: string | null
          social_links?: Json | null
          verification_status?: string
          verified_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          specialization?: string | null
          license_number?: string | null
          address?: string | null
          working_hours?: Json | null
          services?: Json | null
          website?: string | null
          social_links?: Json | null
          verification_status?: string
          verified_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          featured_image: string | null
          cancer_types: CancerType[] | null
          tags: string[] | null
          status: ContentStatus
          views_count: number
          likes_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          featured_image?: string | null
          cancer_types?: CancerType[] | null
          tags?: string[] | null
          status?: ContentStatus
          views_count?: number
          likes_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          featured_image?: string | null
          cancer_types?: CancerType[] | null
          tags?: string[] | null
          status?: ContentStatus
          views_count?: number
          likes_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          cancer_type: CancerType | null
          tags: string[] | null
          is_anonymous: boolean
          likes_count: number
          comments_count: number
          is_pinned: boolean
          status: ContentStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          cancer_type?: CancerType | null
          tags?: string[] | null
          is_anonymous?: boolean
          likes_count?: number
          comments_count?: number
          is_pinned?: boolean
          status?: ContentStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          cancer_type?: CancerType | null
          tags?: string[] | null
          is_anonymous?: boolean
          likes_count?: number
          comments_count?: number
          is_pinned?: boolean
          status?: ContentStatus
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          data: Json | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          article_notifications: boolean
          appointment_notifications: boolean
          message_notifications: boolean
          system_notifications: boolean
          community_notifications: boolean
          email_notifications: boolean
          push_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_notifications?: boolean
          appointment_notifications?: boolean
          message_notifications?: boolean
          system_notifications?: boolean
          community_notifications?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_notifications?: boolean
          appointment_notifications?: boolean
          message_notifications?: boolean
          system_notifications?: boolean
          community_notifications?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          attachments: Json | null
          is_read: boolean
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          attachments?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          attachments?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_directory: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          wilaya: string
          commune: string
          avatar_url: string | null
          bio: string | null
          specialization: string | null
          verification_status: string
          entity_name: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      cancer_type: CancerType
      content_status: ContentStatus
      notification_type: NotificationType
      language_preference: LanguagePreference
    }
  }
}
