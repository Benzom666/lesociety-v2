/**
 * CREATE TEST USERS SCRIPT
 * 
 * Creates deterministic test users with email_confirmed=true
 * for local development and testing
 * 
 * Usage:
 *   cd scripts
 *   tsx create-test-users.ts
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

const TEST_USERS = [
  {
    email: 'admin@lesociety.com',
    password: 'Admin123!@#',
    profile: {
      username: 'admin',
      role: 'admin',
      status: 'verified',
      gender: 'male',
      step_completed: 5,
      age: 30,
    }
  },
  {
    email: 'john@example.com',
    password: 'John123!@#',
    profile: {
      username: 'john_doe',
      role: 'user',
      status: 'verified',
      gender: 'male',
      step_completed: 4,
      age: 28,
      tagline: 'Looking for adventure',
    }
  },
  {
    email: 'jane@example.com',
    password: 'Jane123!@#',
    profile: {
      username: 'jane_smith',
      role: 'user',
      status: 'verified',
      gender: 'female',
      step_completed: 4,
      age: 26,
      tagline: 'Love to travel',
    }
  },
];

async function createTestUsers() {
  console.log('🔄 Creating test users...\n');

  for (const testUser of TEST_USERS) {
    console.log(`Creating: ${testUser.email}`);

    try {
      // 1. Create auth user with email_confirmed=true
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          username: testUser.profile.username,
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ℹ️  User already exists, skipping...`);
          continue;
        }
        console.error(`  ❌ Auth error: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.error(`  ❌ No user data returned`);
        continue;
      }

      console.log(`  ✓ Created auth user: ${authData.user.id}`);

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testUser.email,
          ...testUser.profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        if (profileError.code === '23505') { // Duplicate key
          console.log(`  ℹ️  Profile already exists`);
        } else {
          console.error(`  ❌ Profile error: ${profileError.message}`);
        }
      } else {
        console.log(`  ✓ Created profile`);
      }

      console.log('');
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✅ Test users creation complete!\n');
  console.log('📋 Test Credentials:');
  console.log('═'.repeat(50));
  TEST_USERS.forEach(u => {
    console.log(`Email:    ${u.email}`);
    console.log(`Password: ${u.password}`);
    console.log(`Role:     ${u.profile.role}`);
    console.log('-'.repeat(50));
  });
  console.log('');
  console.log('🔐 These users have email_confirmed=true and can login immediately');
}

createTestUsers().catch(console.error);

