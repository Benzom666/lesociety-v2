-- LeSociety v2 - Storage Buckets Setup
-- Run this in Supabase Dashboard SQL Editor or via psql

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-images', 'profile-images', false),
  ('date-images', 'date-images', false),
  ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - profile-images bucket
-- =====================================================

-- Users can upload their own profile images
CREATE POLICY "Users can upload own profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own profile images
CREATE POLICY "Users can update own profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own profile images
CREATE POLICY "Users can delete own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view profile images of verified users
CREATE POLICY "Anyone can view verified profile images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id::text = (storage.foldername(name))[1]
        AND status = 'verified'
    )
  );

-- =====================================================
-- STORAGE POLICIES - date-images bucket
-- =====================================================

-- Users can upload images for their own date posts
CREATE POLICY "Users can upload date images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'date-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Users can update images for their own date posts
CREATE POLICY "Users can update date images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'date-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Users can delete images for their own date posts
CREATE POLICY "Users can delete date images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'date-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Anyone can view date images for published posts
CREATE POLICY "Anyone can view date images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'date-images'
  );

-- =====================================================
-- STORAGE POLICIES - verification-docs bucket (PRIVATE)
-- =====================================================

-- Users can upload their own verification documents
CREATE POLICY "Users can upload own verification docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own verification documents
CREATE POLICY "Users can update own verification docs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own verification documents
CREATE POLICY "Users can view own verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

