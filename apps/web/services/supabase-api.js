/**
 * Supabase API Service Layer
 * 
 * This adapter maintains compatibility with the existing v1 API response format
 * while using Supabase backend. All functions return data in the shape:
 * { data: { data: payload, message: string } }
 * 
 * RULES:
 * - Never use service_role_key in client code
 * - All client operations use anon key + RLS
 * - Server-only operations use API routes
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (browser-safe)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only throw error if actually being used (not during build)
let supabase;

const getSupabaseClient = () => {
  // During SSR, return null to avoid initialization errors
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return supabase;
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
 * Helper to format error like v1 API
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
 * AUTH: Login
 * Endpoint: POST /user/login
 * Payload: { email, password }
 * Returns: user + token + profile data
 */
export const login = async ({ email, password }) => {
  try {
    const supabase = getSupabaseClient();
    // Supabase auth sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      throw formatError(
        authError.message === 'Invalid login credentials'
          ? 'Given user email is not registered'
          : authError.message
      );
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw formatError('Profile not found');
    }

    // Format response to match v1 API
    const userData = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        token: authData.session.access_token, // This is what v1 used
        ...profile,
      },
      step_completed: profile.step_completed || 1,
      status: profile.status === 'verified' ? 2 : profile.status === 'blocked' ? 3 : 1,
      verified_screen_shown: profile.verified_screen_shown || false,
      request_change_fired: profile.request_change_fired || false,
      tag_desc_verified: profile.tag_desc_verified !== false,
      gender: profile.gender,
      role: profile.role
    };

    return formatResponse(userData, 'Login successful');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Login failed');
  }
};

/**
 * AUTH: Signup (Step 1)
 * Endpoint: POST /user/signup
 * Payload: { email, password, username, gender, age, referralCode? }
 * Returns: user + token
 */
export const signup = async (payload) => {
  try {
    const { email, password, username, gender, age, referralCode } = payload;

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUsername) {
      throw formatError('Username already exists', { username: 'Username already exists' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          gender,
          age: parseInt(age)
        }
      }
    });

    if (authError) {
      // Check for duplicate email
      if (authError.message.includes('already registered')) {
        throw formatError('Email already exists', { email: 'Email already exists' });
      }
      throw formatError(authError.message, {});
    }

    // The trigger will create the profile automatically
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fetch the created profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      // If trigger didn't work, manually create profile
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          username,
          gender,
          age: parseInt(age),
          referral_code: referralCode || null,
          step_completed: 1,
          role: 'user',
          status: 'pending'
        })
        .select()
        .single();

      if (manualError) {
        throw formatError('Failed to create profile');
      }
    }

    const userData = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        token: authData.session.access_token,
        username,
        gender,
        age: parseInt(age)
      },
      step_completed: 1,
      status: 1,
      gender,
      role: 'user'
    };

    return formatResponse(userData, 'Signup successful');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Signup failed', {});
  }
};

/**
 * AUTH: Logout
 * Endpoint: POST /user/logout
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return formatResponse({}, 'Logout successful');
  } catch (error) {
    throw formatError(error.message || 'Logout failed');
  }
};

/**
 * PROFILE: Signup Step 2
 * Endpoint: POST /user/signup/step2
 * Payload: varies by gender (location, tagline, description, etc.)
 */
export const signupStep2 = async (payload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const updateData = {
      ...payload,
      step_completed: 2
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw formatError(error.message);

    return formatResponse({
      user: {
        id: profile.id,
        ...profile
      },
      step_completed: 2
    }, 'Profile updated');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Step 2 failed');
  }
};

/**
 * PROFILE: Signup Step 3
 * Endpoint: POST /user/signup/step3
 * Payload: { images: [{url}], verified: boolean }
 */
export const signupStep3 = async (payload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    // Update step_completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ step_completed: 3 })
      .eq('id', user.id);

    if (profileError) throw formatError(profileError.message);

    // Insert profile photos if images provided
    if (payload.images && payload.images.length > 0) {
      const photos = payload.images.map((img, index) => ({
        user_id: user.id,
        storage_path: img.url,
        is_verified: payload.verified || true,
        sort_order: index
      }));

      const { error: photosError } = await supabase
        .from('profile_photos')
        .insert(photos);

      if (photosError) {
        console.error('Failed to insert photos:', photosError);
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return formatResponse({
      user: {
        id: profile.id,
        ...profile
      },
      step_completed: 3
    }, 'Photos uploaded');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Step 3 failed');
  }
};

/**
 * PROFILE: Signup Step 4 (verification documents)
 * Endpoint: POST /user/signup/step4
 * Payload: { selfie, documentImage }
 */
export const signupStep4 = async (payload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    // Update step_completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ step_completed: 4 })
      .eq('id', user.id);

    if (profileError) throw formatError(profileError.message);

    // Insert or update verification documents
    const { error: verifyError } = await supabase
      .from('verification_documents')
      .upsert({
        user_id: user.id,
        selfie_path: payload.selfie,
        document_path: payload.documentImage,
        documents_verified: false
      });

    if (verifyError) throw formatError(verifyError.message);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return formatResponse({
      user: {
        id: profile.id,
        ...profile
      },
      step_completed: 4
    }, 'Verification documents uploaded');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Step 4 failed');
  }
};

/**
 * SESSION: Get current user
 * Returns current session + profile data
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        token: (await supabase.auth.getSession()).data.session?.access_token,
        ...profile
      },
      step_completed: profile.step_completed,
      status: profile.status === 'verified' ? 2 : profile.status === 'blocked' ? 3 : 1,
      gender: profile.gender,
      role: profile.role
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
};

/**
 * AUTH: Forgot Password
 * Endpoint: POST /user/forgot-password
 * Payload: { email }
 */
export const forgotPassword = async ({ email }) => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`
    });

    if (error) throw formatError(error.message);

    return formatResponse({}, 'Password reset email sent');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Forgot password failed');
  }
};

/**
 * AUTH: Reset Password
 * Endpoint: POST /user/reset-password
 * Payload: { password }
 */
export const resetPassword = async ({ password }) => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw formatError(error.message);

    return formatResponse({}, 'Password reset successful');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Reset password failed');
  }
};

/**
 * PROFILE: Get Profile
 * Endpoint: GET /user/profile
 */
export const getProfile = async () => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw formatError(error.message);

    return formatResponse({
      user: {
        id: profile.id,
        ...profile
      }
    }, 'Profile retrieved');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Get profile failed');
  }
};

/**
 * PROFILE: Update Profile
 * Endpoint: PUT /user/profile
 * Payload: { any profile fields }
 */
export const updateProfile = async (payload) => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw formatError(error.message);

    return formatResponse({
      user: {
        id: profile.id,
        ...profile
      }
    }, 'Profile updated');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Update profile failed');
  }
};

export default {
  login,
  signup,
  logout,
  signupStep2,
  signupStep3,
  signupStep4,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
};

