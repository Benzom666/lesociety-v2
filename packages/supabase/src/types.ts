/**
 * Database types generated from Supabase
 * Run: npx supabase gen types typescript --local > packages/supabase/src/types.ts
 * 
 * For now, we'll define the basic structure
 * These will be replaced with actual generated types after Supabase setup
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
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
      }
      user_photos: {
        Row: UserPhotoRow
        Insert: UserPhotoInsert
        Update: UserPhotoUpdate
      }
      dates: {
        Row: DateRow
        Insert: DateInsert
        Update: DateUpdate
      }
      chatrooms: {
        Row: ChatRoomRow
        Insert: ChatRoomInsert
        Update: ChatRoomUpdate
      }
      messages: {
        Row: MessageRow
        Insert: MessageInsert
        Update: MessageUpdate
      }
      // Additional tables will be added in Phase 2
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: 'pending' | 'verified' | 'blocked' | 'deleted'
      user_role: 'user' | 'admin'
      gender: 'male' | 'female'
      date_status: 'draft' | 'pending' | 'verified' | 'blocked' | 'deleted'
    }
  }
}

// User Types
export interface UserRow {
  id: string
  email: string
  user_name: string
  gender: Database['public']['Enums']['gender']
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  age: number
  location: string | null
  country_code: string | null
  country: string | null
  province: string | null
  body_type: string | null
  ethnicity: string | null
  height: string | null
  occupation: string | null
  max_education: string | null
  is_smoker: string | null
  tagline: string | null
  description: string | null
  step_completed: number
  role: Database['public']['Enums']['user_role']
  status: Database['public']['Enums']['user_status']
  email_verified: boolean
  documents_verified: boolean
  verified: boolean
  is_new: boolean
  profile_completed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserInsert extends Omit<UserRow, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface UserUpdate extends Partial<UserInsert> {}

// User Photo Types
export interface UserPhotoRow {
  id: string
  user_id: string
  photo_url: string
  is_verified: boolean
  is_main: boolean
  order: number
  created_at: string
}

export interface UserPhotoInsert extends Omit<UserPhotoRow, 'id' | 'created_at'> {
  id?: string
  created_at?: string
}

export interface UserPhotoUpdate extends Partial<UserPhotoInsert> {}

// Date Types
export interface DateRow {
  id: string
  user_id: string
  location: string
  country_code: string | null
  country: string | null
  province: string | null
  standard_class_date: string | null
  middle_class_dates: string | null
  executive_class_dates: string | null
  date_length: string | null
  price: number | null
  date_details: string | null
  status: Database['public']['Enums']['date_status']
  is_draft: boolean
  is_new: boolean
  created_at: string
  updated_at: string
}

export interface DateInsert extends Omit<DateRow, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface DateUpdate extends Partial<DateInsert> {}

// ChatRoom Types
export interface ChatRoomRow {
  id: string
  date_id: string
  status: 'pending' | 'accepted' | 'blocked'
  blocked_by: string | null
  is_super_interested: boolean
  created_at: string
  updated_at: string
}

export interface ChatRoomInsert extends Omit<ChatRoomRow, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface ChatRoomUpdate extends Partial<ChatRoomInsert> {}

// Message Types
export interface MessageRow {
  id: string
  room_id: string
  sender_id: string
  receiver_id: string
  message: string
  read_at: string | null
  mail_notified: boolean
  created_at: string
}

export interface MessageInsert extends Omit<MessageRow, 'id' | 'created_at'> {
  id?: string
  created_at?: string
}

export interface MessageUpdate extends Partial<MessageInsert> {}

