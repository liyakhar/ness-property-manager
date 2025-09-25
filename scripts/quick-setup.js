#!/usr/bin/env node

/**
 * Quick Supabase Setup - One command setup
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Supabase Setup for Property Management App\n');

// Create a comprehensive setup guide
const setupGuide = `# 🚀 Quick Supabase Setup Guide

## What I've prepared for you:

✅ **Environment Configuration** - .env.local with your Supabase URL
✅ **Database Migration SQL** - Ready to run in Supabase
✅ **Data Migration Script** - Migrate your existing data
✅ **Storage Setup** - Property images storage configuration

## 🎯 One-Click Setup Process:

### Step 1: Get Your Supabase API Key
1. Go to: https://supabase.com/dashboard
2. Select project: **uqlugqxtoikerjywlnxa**
3. Go to **Settings** → **API**
4. Copy your **"anon public"** key (starts with eyJ...)

### Step 2: Update Configuration
Replace \`your-anon-key-here\` in .env.local with your actual key:

\`\`\`bash
# Edit .env.local and replace the key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-actual-key-here
\`\`\`

### Step 3: Run Database Migration
1. Go to your Supabase dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of \`scripts/supabase-migration.sql\`
4. Click **Run** to create tables and storage bucket

### Step 4: Migrate Your Data
\`\`\`bash
node scripts/migrate-to-supabase.js
\`\`\`

### Step 5: Start Your App
\`\`\`bash
bun run dev
\`\`\`

## 🎉 What You Get:

- **Cloud Database**: Your data stored securely in Supabase
- **Image Storage**: Property images stored in Supabase Storage
- **Real-time Sync**: Live data updates across devices
- **Automatic Backups**: Your data is safe and backed up
- **Scalability**: Handle unlimited properties and tenants

## 📊 Current Data Status:

- **Local SQLite**: 1 property, 0 tenants, 0 updates
- **Supabase**: Ready to receive your data
- **Migration**: Automated script ready to run

## 🔧 Troubleshooting:

If you encounter issues:
1. Make sure your Supabase API key is correct
2. Check that the SQL migration ran successfully
3. Verify your .env.local file is in the project root
4. Check the browser console for any errors

Your existing data will be preserved and migrated to the cloud!
`;

fs.writeFileSync(path.join(process.cwd(), 'QUICK_SETUP_GUIDE.md'), setupGuide);

// Create a simple environment file template
const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uqlugqxtoikerjywlnxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration
DATABASE_URL="file:./dev.db"

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=property-images
`;

// Check if .env.local exists, if not create it
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local template');
} else {
  console.log('✅ .env.local already exists');
}

console.log('✅ Created QUICK_SETUP_GUIDE.md');
console.log('\n🎯 Next Steps:');
console.log('1. Get your Supabase API key from: https://supabase.com/dashboard');
console.log('2. Update .env.local with your API key');
console.log('3. Run the SQL migration in Supabase dashboard');
console.log('4. Run: node scripts/migrate-to-supabase.js');
console.log('5. Start your app: bun run dev');
console.log('\n📖 Check QUICK_SETUP_GUIDE.md for detailed instructions');
console.log('\n🚀 Your data will be stored in Supabase cloud!');
