/**
 * Admin API: Update Date Post Status
 * Server-side only, uses service_role key
 * 
 * PUT /api/admin/dates/[id]
 * Body: { status: 'verified' | 'blocked' | 'pending' | 'deleted' }
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'Missing id or status' });
  }

  if (!['pending', 'verified', 'blocked', 'deleted', 'warned', 'resubmitted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabase
      .from('date_posts')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
        is_published: status === 'verified'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ date: data });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

