/**
 * DEV AUTH RESET SCRIPT
 * 
 * Deletes test users from auth.users and profiles for clean testing
 * Safe to run multiple times (idempotent)
 * 
 * Usage:
 *   cd scripts
 *   tsx dev-reset-auth.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_EMAILS = [
  'admin@lesociety.com',
  'john@example.com',
  'jane@example.com',
  'test@example.com',
];

async function resetAuth() {
  console.log('🔄 Starting auth reset...\n');

  for (const email of TEST_EMAILS) {
    console.log(`Processing: ${email}`);

    try {
      // 1. Find user in auth.users by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`  ❌ Error listing users: ${listError.message}`);
        continue;
      }

      const user = users.users.find(u => u.email === email);

      if (!user) {
        console.log(`  ℹ️  User not found in auth.users`);
        continue;
      }

      console.log(`  ✓ Found user: ${user.id}`);

      // 2. Delete from profiles (cascade will handle related data)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error(`  ⚠️  Profile delete error: ${profileError.message}`);
      } else {
        console.log(`  ✓ Deleted profile`);
      }

      // 3. Delete from auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        console.error(`  ❌ Auth delete error: ${authError.message}`);
      } else {
        console.log(`  ✓ Deleted from auth.users`);
      }

      console.log('');
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✅ Auth reset complete!\n');
  console.log('Next step: Run create-test-users.ts to create fresh test users');
}

resetAuth().catch(console.error);

