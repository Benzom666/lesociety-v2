import { createServerClient } from './client';

/**
 * Storage Helper - Upload file to Supabase Storage
 * Uses service role for admin uploads or user context for user uploads
 */
export async function uploadFile(params: {
  bucket: 'profile-images' | 'date-images' | 'verification-docs';
  path: string;
  file: File | Buffer;
  contentType?: string;
  upsert?: boolean;
}) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from(params.bucket)
    .upload(params.path, params.file, {
      contentType: params.contentType,
      upsert: params.upsert ?? false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
}

/**
 * Storage Helper - Get signed URL for private file
 * Returns a temporary URL that expires after specified duration
 */
export async function getSignedUrl(params: {
  bucket: 'profile-images' | 'date-images' | 'verification-docs';
  path: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
}) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from(params.bucket)
    .createSignedUrl(params.path, params.expiresIn ?? 3600);

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Storage Helper - Get public URL
 * Use only for public buckets
 */
export function getPublicUrl(params: {
  bucket: 'profile-images' | 'date-images' | 'verification-docs';
  path: string;
}) {
  const supabase = createServerClient();

  const { data } = supabase.storage.from(params.bucket).getPublicUrl(params.path);

  return data.publicUrl;
}

/**
 * Storage Helper - Delete file
 */
export async function deleteFile(params: {
  bucket: 'profile-images' | 'date-images' | 'verification-docs';
  paths: string[];
}) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage.from(params.bucket).remove(params.paths);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }

  return data;
}

/**
 * Storage Helper - List files in a directory
 */
export async function listFiles(params: {
  bucket: 'profile-images' | 'date-images' | 'verification-docs';
  path?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage.from(params.bucket).list(params.path, {
    limit: params.limit ?? 100,
    offset: params.offset ?? 0,
  });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return data;
}

