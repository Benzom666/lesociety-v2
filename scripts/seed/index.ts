#!/usr/bin/env tsx
/**
 * LeSociety v2 - Database Seed Script
 * 
 * This script creates demo data for testing:
 * - 1 admin user
 * - 1 male user
 * - 1 female user
 * - 1 date post
 * - 1 chatroom with 2 messages
 * 
 * Usage:
 *   pnpm --filter @lesociety/seed seed
 * 
 * Requirements:
 *   - Supabase project must be set up
 *   - Environment variables must be configured
 *   - Migrations must be run first
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from root .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // =====================================================
    // 1. CREATE ADMIN USER
    // =====================================================
    console.log('📝 Creating admin user...');
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'admin@lesociety.com',
      password: 'admin123456',
      email_confirm: true,
    });

    if (adminAuthError) {
      console.error('❌ Failed to create admin auth user:', adminAuthError.message);
      throw adminAuthError;
    }

    const adminUserId = adminAuth.user.id;

    const { error: adminProfileError } = await supabase.from('profiles').insert({
      id: adminUserId,
      email: 'admin@lesociety.com',
      username: 'admin',
      role: 'admin',
      status: 'verified',
      gender: 'male',
      step_completed: 5,
      age: 30,
      tagline: 'LeSociety Administrator',
      description: 'System administrator account',
      country: 'Canada',
      province: 'Ontario',
      city: 'Toronto',
      is_verified: true,
      verified_at: new Date().toISOString(),
    });

    if (adminProfileError) {
      console.error('❌ Failed to create admin profile:', adminProfileError.message);
      throw adminProfileError;
    }

    console.log('✅ Admin user created: admin@lesociety.com / admin123456\n');

    // =====================================================
    // 2. CREATE MALE USER
    // =====================================================
    console.log('📝 Creating male user...');
    const { data: maleAuth, error: maleAuthError } = await supabase.auth.admin.createUser({
      email: 'john@example.com',
      password: 'password123',
      email_confirm: true,
    });

    if (maleAuthError) {
      console.error('❌ Failed to create male auth user:', maleAuthError.message);
      throw maleAuthError;
    }

    const maleUserId = maleAuth.user.id;

    const { error: maleProfileError } = await supabase.from('profiles').insert({
      id: maleUserId,
      email: 'john@example.com',
      username: 'john_doe',
      role: 'user',
      status: 'verified',
      gender: 'male',
      step_completed: 5,
      age: 28,
      tagline: 'Adventure seeker',
      description: 'Love outdoor activities and good conversation',
      country: 'Canada',
      province: 'Ontario',
      city: 'Toronto',
      height: '6\'0"',
      body_type: 'Athletic',
      education: 'Bachelor\'s Degree',
      occupation: 'Software Engineer',
      is_verified: true,
      verified_at: new Date().toISOString(),
    });

    if (maleProfileError) {
      console.error('❌ Failed to create male profile:', maleProfileError.message);
      throw maleProfileError;
    }

    console.log('✅ Male user created: john@example.com / password123\n');

    // =====================================================
    // 3. CREATE FEMALE USER
    // =====================================================
    console.log('📝 Creating female user...');
    const { data: femaleAuth, error: femaleAuthError } = await supabase.auth.admin.createUser({
      email: 'sarah@example.com',
      password: 'password123',
      email_confirm: true,
    });

    if (femaleAuthError) {
      console.error('❌ Failed to create female auth user:', femaleAuthError.message);
      throw femaleAuthError;
    }

    const femaleUserId = femaleAuth.user.id;

    const { error: femaleProfileError } = await supabase.from('profiles').insert({
      id: femaleUserId,
      email: 'sarah@example.com',
      username: 'sarah_smith',
      role: 'user',
      status: 'verified',
      gender: 'female',
      step_completed: 5,
      age: 26,
      tagline: 'Food lover & travel enthusiast',
      description: 'Always up for trying new restaurants and exploring new cities',
      country: 'Canada',
      province: 'Ontario',
      city: 'Toronto',
      height: '5\'6"',
      body_type: 'Slim',
      education: 'Master\'s Degree',
      occupation: 'Marketing Manager',
      is_verified: true,
      verified_at: new Date().toISOString(),
    });

    if (femaleProfileError) {
      console.error('❌ Failed to create female profile:', femaleProfileError.message);
      throw femaleProfileError;
    }

    console.log('✅ Female user created: sarah@example.com / password123\n');

    // =====================================================
    // 4. CREATE DATE POST
    // =====================================================
    console.log('📝 Creating date post...');
    const { data: datePost, error: datePostError } = await supabase
      .from('date_posts')
      .insert({
        creator_id: femaleUserId,
        tier: 'middle',
        category: 'Dinner',
        aspiration: 'Fine Dining',
        details: 'Looking for someone to join me for an elegant dinner at a new Italian restaurant downtown. Must be a gentleman who appreciates good food and conversation.',
        price: 100,
        country: 'Canada',
        province: 'Ontario',
        city: 'Toronto',
        location_name: 'Downtown Toronto',
        date_day: 'Friday',
        date_time: '7:00 PM',
        is_published: true,
        status: 'verified',
        verified_by: adminUserId,
      })
      .select()
      .single();

    if (datePostError) {
      console.error('❌ Failed to create date post:', datePostError.message);
      throw datePostError;
    }

    console.log('✅ Date post created\n');

    // =====================================================
    // 5. CREATE CHATROOM
    // =====================================================
    console.log('📝 Creating chatroom...');
    const { data: chatroom, error: chatroomError } = await supabase
      .from('chatrooms')
      .insert({
        date_post_id: datePost.id,
        requester_id: maleUserId,
        receiver_id: femaleUserId,
        status: 'accepted',
        is_super_interested: true,
      })
      .select()
      .single();

    if (chatroomError) {
      console.error('❌ Failed to create chatroom:', chatroomError.message);
      throw chatroomError;
    }

    console.log('✅ Chatroom created\n');

    // =====================================================
    // 6. CREATE MESSAGES
    // =====================================================
    console.log('📝 Creating messages...');
    const messages = [
      {
        chatroom_id: chatroom.id,
        sender_id: maleUserId,
        content: 'Hi Sarah! Your dinner date sounds amazing. I love Italian food! Would love to join you.',
      },
      {
        chatroom_id: chatroom.id,
        sender_id: femaleUserId,
        content: 'Hi John! Great to hear from you. Your profile looks interesting. Let\'s make it happen!',
        read_at: new Date().toISOString(),
      },
    ];

    const { error: messagesError } = await supabase.from('messages').insert(messages);

    if (messagesError) {
      console.error('❌ Failed to create messages:', messagesError.message);
      throw messagesError;
    }

    console.log('✅ Messages created\n');

    // =====================================================
    // 7. CREATE SAMPLE NOTIFICATION
    // =====================================================
    console.log('📝 Creating sample notification...');
    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: femaleUserId,
      title: 'New Date Request',
      message: 'John Doe has requested to join your date!',
      type: 'date',
      status: 'unread',
      related_id: chatroom.id,
    });

    if (notificationError) {
      console.error('❌ Failed to create notification:', notificationError.message);
      throw notificationError;
    }

    console.log('✅ Notification created\n');

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Test Accounts:');
    console.log('   Admin:  admin@lesociety.com / admin123456');
    console.log('   Male:   john@example.com / password123');
    console.log('   Female: sarah@example.com / password123\n');
    console.log('📊 Sample Data:');
    console.log('   • 3 users (1 admin, 1 male, 1 female)');
    console.log('   • 1 date post (verified & published)');
    console.log('   • 1 chatroom (accepted)');
    console.log('   • 2 messages');
    console.log('   • 1 notification\n');
    console.log('🎯 Next Steps:');
    console.log('   1. Log in with any test account');
    console.log('   2. Browse date posts');
    console.log('   3. Test chat functionality');
    console.log('   4. Admin can moderate from admin panel\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seed();

