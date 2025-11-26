/**
 * TypeScript Types for Supabase Database
 * Auto-generated types based on database schema
 * Requirements: 2.1
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          streak: number
          coins: number
          xp: number
          level: number
          last_completion_date: string | null
          interests: string[]
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          streak?: number
          coins?: number
          xp?: number
          last_completion_date?: string | null
          interests?: string[]
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          streak?: number
          coins?: number
          xp?: number
          last_completion_date?: string | null
          interests?: string[]
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          category: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge'
          duration_seconds: number
          tags: string[]
          difficulty: 1 | 2 | 3 | 4 | 5
          type: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge'
          completion_count: number
          affiliate_link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge'
          duration_seconds: number
          tags?: string[]
          difficulty: 1 | 2 | 3 | 4 | 5
          type: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge'
          completion_count?: number
          affiliate_link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge'
          duration_seconds?: number
          tags?: string[]
          difficulty?: 1 | 2 | 3 | 4 | 5
          type?: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge'
          completion_count?: number
          affiliate_link?: string | null
          created_at?: string
        }
      }
      daily_user_tasks: {
        Row: {
          id: string
          user_id: string
          task_id: string
          assigned_date: string
          completed: boolean
          completed_at: string | null
          coins_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          assigned_date: string
          completed?: boolean
          completed_at?: string | null
          coins_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          assigned_date?: string
          completed?: boolean
          completed_at?: string | null
          coins_earned?: number
          created_at?: string
        }
      }
      completions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          completed_at: string
          coins_earned: number
          streak_at_completion: number
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          completed_at?: string
          coins_earned: number
          streak_at_completion: number
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          completed_at?: string
          coins_earned?: number
          streak_at_completion?: number
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_name: string
          badge_description: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_name: string
          badge_description: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_name?: string
          badge_description?: string
          earned_at?: string
        }
      }
      leaderboard_snapshots: {
        Row: {
          id: string
          user_id: string
          rank: number
          coins: number
          streak: number
          period_type: 'weekly' | 'monthly'
          period_end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rank: number
          coins: number
          streak: number
          period_type: 'weekly' | 'monthly'
          period_end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rank?: number
          coins?: number
          streak?: number
          period_type?: 'weekly' | 'monthly'
          period_end_date?: string
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          created_at?: string
        }
      }
      revenue_tracking: {
        Row: {
          id: string
          amount: number
          source: 'stripe' | 'affiliate' | 'adsense'
          transaction_id: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          source: 'stripe' | 'affiliate' | 'adsense'
          transaction_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          source?: 'stripe' | 'affiliate' | 'adsense'
          transaction_id?: string | null
          user_id?: string | null
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
      [_ in never]: never
    }
  }
}
