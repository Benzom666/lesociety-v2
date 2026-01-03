/**
 * Health Check API
 * Verifies Supabase connectivity without exposing secrets
 * 
 * GET /api/health
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checks = {
    database: false,
    storage: false,
    auth: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Initialize client server-side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        status: 'error',
        message: 'Missing Supabase configuration',
        checks
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check Database (select from profiles)
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      checks.database = !dbError;
    } catch (e) {
      checks.database = false;
    }

    // Check Storage (list buckets)
    try {
      const { data: buckets, error: storageError } = await supabase
        .storage
        .listBuckets();
      
      checks.storage = !storageError && Array.isArray(buckets);
    } catch (e) {
      checks.storage = false;
    }

    // Check Auth (get session - will be null but endpoint should work)
    try {
      const { error: authError } = await supabase.auth.getSession();
      checks.auth = !authError;
    } catch (e) {
      checks.auth = false;
    }

    const allHealthy = checks.database && checks.storage && checks.auth;

    return res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      checks
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      checks
    });
  }
}

