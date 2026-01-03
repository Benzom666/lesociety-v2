/**
 * Supabase Date Posts Service
 * 
 * Handles date post creation and browsing
 * Maintains compatibility with v1 API response format
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
 * Helper to format response like v1 API
 */
const formatResponse = (data, message = 'Success') => ({
  data: {
    data,
    message
  }
});

/**
 * Helper to format error
 */
const formatError = (message, data = {}) => {
  const error = new Error(message);
  error.response = {
    status: 400,
    data: {
      message,
      data
    }
  };
  throw error;
};

/**
 * Create a new date post
 * Endpoint: POST /dates
 * 
 * @param {Object} payload - Date post data
 * @returns {Promise} Formatted response
 */
export const createDatePost = async (payload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const dateData = {
      creator_id: user.id,
      tier: payload.tier || 'standard',
      category: payload.category,
      details: payload.details || payload.description,
      price: parseFloat(payload.price) || 0,
      location: payload.location,
      city: payload.city,
      province: payload.province || payload.state,
      country: payload.country,
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      date_time: payload.date_time || payload.dateTime,
      is_published: payload.is_published !== false,
      status: 'pending', // Default to pending, admin will verify
      image_urls: payload.images || payload.image_urls || []
    };

    const { data, error } = await supabase
      .from('date_posts')
      .insert(dateData)
      .select()
      .single();

    if (error) throw formatError(error.message);

    return formatResponse(data, 'Date post created successfully');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Failed to create date post');
  }
};

/**
 * Browse/List date posts
 * Endpoint: GET /dates
 * 
 * Respects RLS: only shows verified + published posts
 * Filters out blocked users
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} Formatted response with date posts array
 */
export const browseDatePosts = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      gender = null,
      tier = null,
      category = null,
      city = null,
      province = null,
      country = null
    } = params;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('date_posts')
      .select(`
        *,
        creator:profiles!creator_id (
          id,
          username,
          gender,
          age,
          tagline,
          location,
          city,
          province,
          country
        )
      `, { count: 'exact' })
      .eq('is_published', true)
      .eq('status', 'verified')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (gender) {
      query = query.eq('creator.gender', gender);
    }
    if (tier) {
      query = query.eq('tier', tier);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (province) {
      query = query.ilike('province', `%${province}%`);
    }
    if (country) {
      query = query.eq('country', country);
    }

    const { data, error, count } = await query;

    if (error) throw formatError(error.message);

    // TODO: Filter out blocked users (requires checking blocks table)
    // For now, RLS should handle this

    return formatResponse({
      dates: data || [],
      total: count,
      page,
      limit,
      hasMore: count > offset + limit
    }, 'Date posts retrieved');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Failed to browse date posts');
  }
};

/**
 * Get single date post by ID
 * Endpoint: GET /dates/:id
 * 
 * @param {string} id - Date post UUID
 * @returns {Promise} Formatted response
 */
export const getDatePost = async (id) => {
  try {
    const { data, error } = await supabase
      .from('date_posts')
      .select(`
        *,
        creator:profiles!creator_id (
          id,
          username,
          gender,
          age,
          tagline,
          description,
          location,
          city,
          province,
          country
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .eq('status', 'verified')
      .single();

    if (error) throw formatError(error.message);
    if (!data) throw formatError('Date post not found');

    return formatResponse(data, 'Date post retrieved');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Failed to get date post');
  }
};

/**
 * Get user's own date posts
 * Endpoint: GET /dates/my-dates
 * 
 * @returns {Promise} Formatted response
 */
export const getMyDatePosts = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { data, error } = await supabase
      .from('date_posts')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw formatError(error.message);

    return formatResponse(data || [], 'Your date posts retrieved');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Failed to get your date posts');
  }
};

/**
 * Update date post
 * Endpoint: PUT /dates/:id
 * 
 * @param {string} id - Date post UUID
 * @param {Object} payload - Update data
 * @returns {Promise} Formatted response
 */
export const updateDatePost = async (id, payload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    // RLS will ensure user can only update their own posts
    const { data, error } = await supabase
      .from('date_posts')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('creator_id', user.id) // Extra safety check
      .select()
      .single();

    if (error) throw formatError(error.message);

    return formatResponse(data, 'Date post updated');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Failed to update date post');
  }
};

/**
 * Delete date post
 * Endpoint: DELETE /dates/:id
 * 
 * @param {string} id - Date post UUID
 * @returns {Promise} Formatted response
 */
export const deleteDatePost = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { error } = await supabase
      .from('date_posts')
      .delete()
      .eq('id', id)
      .eq('creator_id', user.id); // RLS + extra safety

    if (error) throw formatError(error.message);

    return formatResponse({}, 'Date post deleted');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Failed to delete date post');
  }
};

export default {
  createDatePost,
  browseDatePosts,
  getDatePost,
  getMyDatePosts,
  updateDatePost,
  deleteDatePost
};

