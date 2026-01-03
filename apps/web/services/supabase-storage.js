/**
 * Supabase Storage Service
 * 
 * Replaces AWS S3 uploads with Supabase Storage
 * Maintains compatibility with existing v1 API response format
 * 
 * Buckets:
 * - profile-images (public)
 * - date-images (public)
 * - verification-docs (private, requires signed URLs)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;

const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    return null;
  }
  
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables'); return null;
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }); return null;
  }
  return supabase; return null;
};

/**
 * Helper to generate unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

/**
 * Upload files to Supabase Storage
 * 
 * @param {File[]} files - Array of File objects
 * @param {string} bucket - Bucket name ('profile-images' | 'date-images' | 'verification-docs')
 * @param {string} folder - Optional folder path within bucket
 * @returns {Promise<Array>} Array of objects with {url} property (v1 API compatible)
 */
export const uploadFiles = async (files, bucket = 'profile-images', folder = '') => {
  try {
    const uploadPromises = files.map(async (file) => {
      const filename = generateUniqueFilename(file.name);
      const filepath = folder ? `${folder}/${filename}` : filename;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filepath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`Upload failed for ${filename}:`, error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filepath);

      // Return in v1 API format: {url: string}
      return { url: publicUrl };
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Upload files failed:', error);
    throw error;
  }
};

/**
 * Upload single file
 * 
 * @param {File} file - File object
 * @param {string} bucket - Bucket name
 * @param {string} folder - Optional folder path
 * @returns {Promise<string>} Public URL
 */
export const uploadFile = async (file, bucket = 'profile-images', folder = '') => {
  const results = await uploadFiles([file], bucket, folder);
  return results[0].url;
};

/**
 * Get signed URL for private files
 * 
 * @param {string} filepath - Path to file in bucket
 * @param {string} bucket - Bucket name
 * @param {number} expiresIn - Expiry in seconds (default 3600 = 1 hour)
 * @returns {Promise<string>} Signed URL
 */
export const getSignedUrl = async (filepath, bucket = 'verification-docs', expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filepath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Get signed URL failed:', error);
    throw error;
  }
};

/**
 * Delete file from storage
 * 
 * @param {string} filepath - Path to file in bucket
 * @param {string} bucket - Bucket name
 */
export const deleteFile = async (filepath, bucket = 'profile-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filepath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete file failed:', error);
    throw error;
  }
};

/**
 * Upload profile images (replaces v1 imageUploader for profiles)
 * Maintains exact v1 response format
 * 
 * @param {Array} files - Array of File objects or {url} objects (for existing images)
 * @returns {Promise<Array>} Array of {url} objects
 */
export const uploadProfileImages = async (files) => {
  if (!files || files.length === 0) return [];

  const results = [];
  const filesToUpload = [];

  // Separate existing URLs from new files
  for (const fileItem of files) {
    // If it's an array with a File object
    if (Array.isArray(fileItem) && fileItem[0]?.name) {
      filesToUpload.push(fileItem[0]);
    }
    // If it's already uploaded (has url property)
    else if (fileItem.url) {
      results.push({ url: fileItem.url });
    }
    // If it's a File object directly
    else if (fileItem.name) {
      filesToUpload.push(fileItem);
    }
  }

  // Upload new files
  if (filesToUpload.length > 0) {
    const { data: { user } } = await supabase.auth.getUser();
    const folder = user ? `user-${user.id}` : 'temp';
    
    const uploaded = await uploadFiles(filesToUpload, 'profile-images', folder);
    results.push(...uploaded);
  }

  return results;
};

/**
 * Upload verification documents
 * 
 * @param {File} file - Selfie or document file
 * @param {string} type - 'selfie' | 'document'
 * @returns {Promise<string>} File path (not public URL, for private bucket)
 */
export const uploadVerificationDocument = async (file, type = 'selfie') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const filename = generateUniqueFilename(file.name);
    const filepath = `user-${user.id}/${type}-${filename}`;

    const { data, error } = await supabase.storage
      .from('verification-docs')
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Return filepath (not public URL since bucket is private)
    return filepath;
  } catch (error) {
    console.error('Upload verification document failed:', error);
    throw error;
  }
};

/**
 * Upload date images
 * 
 * @param {File[]} files - Array of File objects
 * @returns {Promise<Array>} Array of {url} objects
 */
export const uploadDateImages = async (files) => {
  if (!files || files.length === 0) return [];

  const { data: { user } } = await supabase.auth.getUser();
  const folder = user ? `user-${user.id}` : 'temp';

  return await uploadFiles(files, 'date-images', folder);
};

export default {
  uploadFiles,
  uploadFile,
  getSignedUrl,
  deleteFile,
  uploadProfileImages,
  uploadVerificationDocument,
  uploadDateImages
};

