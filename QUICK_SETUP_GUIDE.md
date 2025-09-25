# 🚀 Quick Supabase Setup Guide

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
Replace `your-anon-key-here` in .env.local with your actual key:

```bash
# Edit .env.local and replace the key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-actual-key-here
```

### Step 3: Run Database Migration
1. Go to your Supabase dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `scripts/supabase-migration.sql`
4. Click **Run** to create tables and storage bucket

### Step 4: Migrate Your Data
```bash
node scripts/migrate-to-supabase.js
```

### Step 5: Start Your App
```bash
bun run dev
```

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
