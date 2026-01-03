-- LeSociety v2 - Initial Schema Migration
-- This migration creates all tables, indexes, constraints, and RLS policies
-- Run this against a fresh Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'blocked', 'deleted')),
  gender TEXT CHECK (gender IN ('male', 'female')),
  step_completed INTEGER DEFAULT 1,
  
  -- Profile details
  age INTEGER,
  tagline TEXT,
  description TEXT,
  
  -- Location
  country TEXT,
  province TEXT,
  city TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Preferences
  looking_for TEXT,
  relationship_status TEXT,
  height TEXT,
  body_type TEXT,
  ethnicity TEXT,
  education TEXT,
  occupation TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
CREATE INDEX idx_profiles_location ON public.profiles(country, province, city);

-- =====================================================
-- PROFILE PHOTOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profile_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profile_photos
CREATE INDEX idx_profile_photos_user_id ON public.profile_photos(user_id);
CREATE INDEX idx_profile_photos_sort ON public.profile_photos(user_id, sort_order);

-- =====================================================
-- VERIFICATION DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  selfie_path TEXT,
  document_path TEXT,
  documents_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for verification_documents
CREATE INDEX idx_verification_documents_user_id ON public.verification_documents(user_id);
CREATE INDEX idx_verification_documents_status ON public.verification_documents(documents_verified);

-- =====================================================
-- DATE POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.date_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Date details
  tier TEXT CHECK (tier IN ('standard', 'middle', 'executive')),
  category TEXT,
  aspiration TEXT,
  details TEXT,
  price NUMERIC NOT NULL,
  
  -- Location
  country TEXT,
  province TEXT,
  city TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Date/time
  date_day TEXT,
  date_time TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'blocked', 'deleted', 'warned', 'resubmitted')),
  
  -- Moderation
  verified_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for date_posts
CREATE INDEX idx_date_posts_creator_id ON public.date_posts(creator_id);
CREATE INDEX idx_date_posts_status ON public.date_posts(status);
CREATE INDEX idx_date_posts_published ON public.date_posts(is_published, status);
CREATE INDEX idx_date_posts_created_at ON public.date_posts(created_at DESC);
CREATE INDEX idx_date_posts_location ON public.date_posts(country, province, city);
CREATE INDEX idx_date_posts_tier ON public.date_posts(tier);

-- =====================================================
-- CHATROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chatrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_post_id UUID REFERENCES public.date_posts(id) ON DELETE SET NULL,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  blocked_by UUID REFERENCES public.profiles(id),
  is_super_interested BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate chatrooms
  CONSTRAINT unique_chatroom UNIQUE(date_post_id, requester_id, receiver_id)
);

-- Indexes for chatrooms
CREATE INDEX idx_chatrooms_requester_id ON public.chatrooms(requester_id);
CREATE INDEX idx_chatrooms_receiver_id ON public.chatrooms(receiver_id);
CREATE INDEX idx_chatrooms_date_post_id ON public.chatrooms(date_post_id);
CREATE INDEX idx_chatrooms_status ON public.chatrooms(status);
CREATE INDEX idx_chatrooms_participants ON public.chatrooms(requester_id, receiver_id);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatroom_id UUID NOT NULL REFERENCES public.chatrooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_chatroom_id ON public.messages(chatroom_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_unread ON public.messages(chatroom_id, read_at) WHERE read_at IS NULL;

-- =====================================================
-- BLOCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate blocks
  CONSTRAINT unique_block UNIQUE(blocker_id, blocked_id),
  -- Prevent self-blocking
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes for blocks
CREATE INDEX idx_blocks_blocker_id ON public.blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_id ON public.blocks(blocked_id);
CREATE INDEX idx_blocks_both ON public.blocks(blocker_id, blocked_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('system', 'chat', 'date', 'verification', 'admin')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  related_id UUID, -- Reference to related entity (chatroom, date_post, etc)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON public.notifications(user_id, status);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if a block exists between two users
CREATE OR REPLACE FUNCTION public.is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_verification_documents_updated_at
  BEFORE UPDATE ON public.verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_date_posts_updated_at
  BEFORE UPDATE ON public.date_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_chatrooms_updated_at
  BEFORE UPDATE ON public.chatrooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

