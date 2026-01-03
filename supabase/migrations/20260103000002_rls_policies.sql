-- LeSociety v2 - Row Level Security (RLS) Policies
-- This migration creates secure RLS policies for all tables
-- Run after initial schema migration

-- =====================================================
-- PROFILES RLS POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view other verified profiles (for browsing), excluding blocked users
CREATE POLICY "Users can view verified profiles"
  ON public.profiles FOR SELECT
  USING (
    status = 'verified'
    AND NOT public.is_blocked(auth.uid(), id)
  );

-- =====================================================
-- PROFILE PHOTOS RLS POLICIES
-- =====================================================

-- Users can view their own photos
CREATE POLICY "Users can view own photos"
  ON public.profile_photos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own photos
CREATE POLICY "Users can insert own photos"
  ON public.profile_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own photos
CREATE POLICY "Users can update own photos"
  ON public.profile_photos FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON public.profile_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Users can view photos of verified profiles (excluding blocked)
CREATE POLICY "Users can view verified profile photos"
  ON public.profile_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id
        AND status = 'verified'
        AND NOT public.is_blocked(auth.uid(), id)
    )
  );

-- Admins can view all photos
CREATE POLICY "Admins can view all photos"
  ON public.profile_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- VERIFICATION DOCUMENTS RLS POLICIES
-- =====================================================

-- Users can view their own verification documents
CREATE POLICY "Users can view own verification docs"
  ON public.verification_documents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own verification documents
CREATE POLICY "Users can insert own verification docs"
  ON public.verification_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification documents
CREATE POLICY "Users can update own verification docs"
  ON public.verification_documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification docs"
  ON public.verification_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update verification status
CREATE POLICY "Admins can update verification docs"
  ON public.verification_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DATE POSTS RLS POLICIES
-- =====================================================

-- Users can view their own date posts
CREATE POLICY "Users can view own date posts"
  ON public.date_posts FOR SELECT
  USING (auth.uid() = creator_id);

-- Users can insert their own date posts
CREATE POLICY "Users can insert own date posts"
  ON public.date_posts FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Users can update their own date posts
CREATE POLICY "Users can update own date posts"
  ON public.date_posts FOR UPDATE
  USING (auth.uid() = creator_id);

-- Users can delete their own date posts
CREATE POLICY "Users can delete own date posts"
  ON public.date_posts FOR DELETE
  USING (auth.uid() = creator_id);

-- Users can view published & verified date posts (excluding blocked creators)
CREATE POLICY "Users can view published date posts"
  ON public.date_posts FOR SELECT
  USING (
    is_published = true
    AND status = 'verified'
    AND NOT public.is_blocked(auth.uid(), creator_id)
  );

-- Admins can view all date posts
CREATE POLICY "Admins can view all date posts"
  ON public.date_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all date posts
CREATE POLICY "Admins can update all date posts"
  ON public.date_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- CHATROOMS RLS POLICIES
-- =====================================================

-- Participants can view their chatrooms (excluding blocked)
CREATE POLICY "Participants can view chatrooms"
  ON public.chatrooms FOR SELECT
  USING (
    (auth.uid() = requester_id OR auth.uid() = receiver_id)
    AND NOT public.is_blocked(requester_id, receiver_id)
  );

-- Users can create chatrooms as requester
CREATE POLICY "Users can create chatrooms as requester"
  ON public.chatrooms FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id
    AND NOT public.is_blocked(requester_id, receiver_id)
  );

-- Receiver can accept chatroom (update status to accepted)
CREATE POLICY "Receiver can accept chatroom"
  ON public.chatrooms FOR UPDATE
  USING (
    auth.uid() = receiver_id
    AND NOT public.is_blocked(requester_id, receiver_id)
  )
  WITH CHECK (
    auth.uid() = receiver_id
    AND NOT public.is_blocked(requester_id, receiver_id)
  );

-- Participants can update their chatrooms (for blocking, etc)
CREATE POLICY "Participants can update chatrooms"
  ON public.chatrooms FOR UPDATE
  USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

-- Admins can view all chatrooms
CREATE POLICY "Admins can view all chatrooms"
  ON public.chatrooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- MESSAGES RLS POLICIES
-- =====================================================

-- Participants can view messages in their chatrooms
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chatrooms
      WHERE id = chatroom_id
        AND (requester_id = auth.uid() OR receiver_id = auth.uid())
        AND status = 'accepted'
        AND NOT public.is_blocked(requester_id, receiver_id)
    )
  );

-- Participants can send messages in accepted chatrooms
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chatrooms
      WHERE id = chatroom_id
        AND (requester_id = auth.uid() OR receiver_id = auth.uid())
        AND status = 'accepted'
        AND NOT public.is_blocked(requester_id, receiver_id)
    )
  );

-- Users can update their own messages (for read receipts, soft delete)
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chatrooms
      WHERE id = chatroom_id
        AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- BLOCKS RLS POLICIES
-- =====================================================

-- Users can view their own blocks (who they blocked)
CREATE POLICY "Users can view own blocks"
  ON public.blocks FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create blocks"
  ON public.blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete own blocks"
  ON public.blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Admins can view all blocks
CREATE POLICY "Admins can view all blocks"
  ON public.blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- NOTIFICATIONS RLS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can insert notifications
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert notifications (via service role)
-- This is handled by using service role key, not RLS

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

