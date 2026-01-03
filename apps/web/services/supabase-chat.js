/**
 * Supabase Chat Service
 * 
 * Handles chatrooms and messages
 * Maintains compatibility with v1 API response format
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;

const getSupabaseClient = () => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
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

const formatResponse = (data, message = 'Success') => ({
  data: {
    data,
    message
  }
});

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
 * CHATROOM: Create or Get Existing
 * Endpoint: POST /chatrooms
 * Payload: { date_post_id, requester_id, receiver_id }
 */
export const createChatroom = async (payload) => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { date_post_id, receiver_id } = payload;

    // Check if chatroom already exists
    const { data: existing } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('date_post_id', date_post_id)
      .eq('requester_id', user.id)
      .eq('receiver_id', receiver_id)
      .single();

    if (existing) {
      return formatResponse(existing, 'Chatroom already exists');
    }

    // Create new chatroom
    const { data: chatroom, error } = await supabase
      .from('chatrooms')
      .insert({
        date_post_id,
        requester_id: user.id,
        receiver_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw formatError(error.message);

    return formatResponse(chatroom, 'Chatroom created');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Create chatroom failed');
  }
};

/**
 * CHATROOM: Get User's Chatrooms
 * Endpoint: GET /chatrooms
 */
export const getChatrooms = async () => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { data, error } = await supabase
      .from('chatrooms')
      .select(`
        *,
        date_post:date_posts (*),
        requester:profiles!requester_id (id, username, gender, age),
        receiver:profiles!receiver_id (id, username, gender, age)
      `)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) throw formatError(error.message);

    return formatResponse(data || [], 'Chatrooms retrieved');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Get chatrooms failed');
  }
};

/**
 * CHATROOM: Update Status (accept/block)
 * Endpoint: PUT /chatrooms/:id
 * Payload: { status: 'accepted' | 'blocked' }
 */
export const updateChatroomStatus = async (chatroomId, payload) => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { status, blocked_by } = payload;

    const updateData = { status, updated_at: new Date().toISOString() };
    if (status === 'blocked') {
      updateData.blocked_by = user.id;
    }

    const { data, error } = await supabase
      .from('chatrooms')
      .update(updateData)
      .eq('id', chatroomId)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .select()
      .single();

    if (error) throw formatError(error.message);

    return formatResponse(data, 'Chatroom status updated');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Update chatroom failed');
  }
};

/**
 * MESSAGE: Send Message
 * Endpoint: POST /messages
 * Payload: { chatroom_id, content }
 */
export const sendMessage = async (payload) => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { chatroom_id, content } = payload;

    // Verify user is participant in chatroom
    const { data: chatroom } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('id', chatroom_id)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .single();

    if (!chatroom) {
      throw formatError('Chatroom not found or access denied');
    }

    if (chatroom.status !== 'accepted') {
      throw formatError('Chatroom must be accepted before sending messages');
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chatroom_id,
        sender_id: user.id,
        content
      })
      .select()
      .single();

    if (error) throw formatError(error.message);

    // Update chatroom updated_at
    await supabase
      .from('chatrooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatroom_id);

    return formatResponse(message, 'Message sent');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Send message failed');
  }
};

/**
 * MESSAGE: Get Messages for Chatroom
 * Endpoint: GET /messages/:chatroom_id
 */
export const getMessages = async (chatroomId, params = {}) => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { limit = 50, before = null } = params;

    // Verify user is participant
    const { data: chatroom } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('id', chatroomId)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .single();

    if (!chatroom) {
      throw formatError('Chatroom not found or access denied');
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (id, username, gender)
      `)
      .eq('chatroom_id', chatroomId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw formatError(error.message);

    return formatResponse(data || [], 'Messages retrieved');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Get messages failed');
  }
};

/**
 * MESSAGE: Mark as Read
 * Endpoint: PUT /messages/:id/read
 */
export const markMessageRead = async (messageId) => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw formatError('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .neq('sender_id', user.id) // Only receiver can mark as read
      .select()
      .single();

    if (error) throw formatError(error.message);

    return formatResponse(data, 'Message marked as read');
  } catch (error) {
    if (error.response) throw error;
    throw formatError(error.message || 'Mark read failed');
  }
};

/**
 * REALTIME: Subscribe to chatroom messages
 * Returns unsubscribe function
 */
export const subscribeToChatroom = (chatroomId, callback) => {
  try {
    const supabase = getSupabaseClient();
    
    const channel = supabase
      .channel(`chatroom:${chatroomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatroom_id=eq.${chatroomId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Subscribe to chatroom failed:', error);
    return () => {}; // Return no-op unsubscribe
  }
};

export default {
  createChatroom,
  getChatrooms,
  updateChatroomStatus,
  sendMessage,
  getMessages,
  markMessageRead,
  subscribeToChatroom
};

