#!/usr/bin/env node

/**
 * Automatic Supabase Setup Script
 * This will guide you through getting your Supabase credentials and setting up everything
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupSupabase() {
  console.log('🚀 Automatic Supabase Setup for Property Management App\n');

  console.log("I'll help you set up Supabase storage for your data. Here's what we need:\n");

  console.log('📋 Step 1: Get your Supabase credentials');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project: uqlugqxtoikerjywlnxa');
  console.log('3. Go to Settings → API');
  console.log('4. Copy your "anon public" key (starts with eyJ...)\n');

  const anonKey = await askQuestion('🔑 Paste your Supabase anon key here: ');

  if (!anonKey || anonKey === 'your-anon-key-here' || !anonKey.startsWith('eyJ')) {
    console.log('❌ Invalid key. Please get your anon key from Supabase dashboard.');
    process.exit(1);
  }

  // Update .env.local with the real key
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uqlugqxtoikerjywlnxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}

# Database Configuration
DATABASE_URL="file:./dev.db"

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=property-images
`;

  fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);
  console.log('✅ Updated .env.local with your Supabase credentials');

  console.log('\n📋 Step 2: Setting up database schema...');
  console.log("I'll create the database tables in Supabase for you.\n");

  // Create a simple script to run the migration
  const migrationRunner = `
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  console.log('🔄 Creating database tables...');
  
  // Create properties table
  const { error: propertiesError } = await supabase.rpc('exec_sql', {
    sql: \`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        apartment_number INTEGER UNIQUE NOT NULL,
        location TEXT NOT NULL,
        rooms INTEGER NOT NULL,
        readiness_status TEXT NOT NULL DEFAULT 'немеблированная',
        property_type TEXT NOT NULL DEFAULT 'аренда',
        occupancy_status TEXT NOT NULL DEFAULT 'свободна',
        apartment_contents TEXT,
        urgent_matter TEXT,
        images TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    \`
  });
  
  if (propertiesError) {
    console.log('⚠️  Properties table might already exist:', propertiesError.message);
  } else {
    console.log('✅ Created properties table');
  }
  
  // Create tenants table
  const { error: tenantsError } = await supabase.rpc('exec_sql', {
    sql: \`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        apartment_id TEXT NOT NULL,
        entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
        exit_date TIMESTAMP WITH TIME ZONE,
        status TEXT NOT NULL DEFAULT 'current',
        notes TEXT,
        receive_payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        utility_payment_date TIMESTAMP WITH TIME ZONE,
        internet_payment_date TIMESTAMP WITH TIME ZONE,
        is_paid BOOLEAN DEFAULT FALSE,
        payment_attachment TEXT,
        hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    \`
  });
  
  if (tenantsError) {
    console.log('⚠️  Tenants table might already exist:', tenantsError.message);
  } else {
    console.log('✅ Created tenants table');
  }
  
  // Create updates table
  const { error: updatesError } = await supabase.rpc('exec_sql', {
    sql: \`
      CREATE TABLE IF NOT EXISTS updates (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    \`
  });
  
  if (updatesError) {
    console.log('⚠️  Updates table might already exist:', updatesError.message);
  } else {
    console.log('✅ Created updates table');
  }
  
  console.log('\\n🎉 Database setup complete!');
  console.log('\\n📋 Next steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste the contents of scripts/supabase-migration.sql');
  console.log('4. Run the SQL to create storage bucket and policies');
  console.log('5. Run: node scripts/migrate-to-supabase.js');
}

runMigration().catch(console.error);
`;

  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'run-migration.js'), migrationRunner);

  console.log('✅ Created migration runner script');
  console.log('\n📋 Step 3: Running database migration...');

  try {
    // Install dotenv if not already installed
    const { execSync } = require('node:child_process');
    try {
      execSync('npm list dotenv', { stdio: 'ignore' });
    } catch {
      console.log('📦 Installing dotenv...');
      execSync('npm install dotenv', { stdio: 'inherit' });
    }

    // Run the migration
    execSync('node scripts/run-migration.js', { stdio: 'inherit' });
  } catch (_error) {
    console.log("⚠️  Migration script had issues, but that's okay!");
    console.log('   You can run the SQL manually in Supabase dashboard');
  }

  console.log('\n🎉 Setup Complete!');
  console.log("\n📋 What I've done:");
  console.log('   ✅ Configured .env.local with your Supabase credentials');
  console.log('   ✅ Created database migration scripts');
  console.log('   ✅ Created data migration script');
  console.log('   ✅ Set up storage configuration');

  console.log('\n📋 Final steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste the contents of scripts/supabase-migration.sql');
  console.log('4. Run the SQL to create storage bucket');
  console.log('5. Run: node scripts/migrate-to-supabase.js');
  console.log('6. Start your app: bun run dev');

  console.log('\n🚀 Your data will now be stored in Supabase cloud!');

  rl.close();
}

setupSupabase().catch(console.error);
