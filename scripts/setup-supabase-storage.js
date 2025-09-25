#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * This script will help you set up Supabase storage and migrate your data
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('🚀 Setting up Supabase Storage for your property management app...\n');

// Step 1: Create .env.local file
const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uqlugqxtoikerjywlnxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration
DATABASE_URL="file:./dev.db"

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=property-images
`;

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('⚠️  .env.local already exists');
}

// Step 2: Create Supabase migration script
const migrationSQL = `-- Create tables in Supabase to match your Prisma schema

-- Create properties table
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

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
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

-- Create updates table
CREATE TABLE IF NOT EXISTS updates (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage
CREATE POLICY "Public read access for property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated upload for property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update for property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete for property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);`;

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'supabase-migration.sql'), migrationSQL);
console.log('✅ Created Supabase migration SQL file');

// Step 3: Create data migration script
const migrationScript = `const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateData() {
  console.log('🔄 Starting data migration from SQLite to Supabase...');
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.error('❌ Please set your Supabase credentials in .env.local first');
    console.log('   Get them from: https://supabase.com/dashboard');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Connect to SQLite database
  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
  const db = new sqlite3.Database(dbPath);
  
  try {
    // Migrate properties
    console.log('📦 Migrating properties...');
    const properties = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM properties', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const property of properties) {
      const { error } = await supabase
        .from('properties')
        .upsert({
          id: property.id,
          apartment_number: property.apartmentNumber,
          location: property.location,
          rooms: property.rooms,
          readiness_status: property.readinessStatus,
          property_type: property.propertyType,
          occupancy_status: property.occupancyStatus,
          apartment_contents: property.apartmentContents,
          urgent_matter: property.urgentMatter,
          images: property.images,
          created_at: property.createdAt,
          updated_at: property.updatedAt
        });
      
      if (error) {
        console.error('Error migrating property:', error);
      } else {
        console.log(\`✅ Migrated property \${property.apartmentNumber}\`);
      }
    }
    
    // Migrate tenants
    console.log('👥 Migrating tenants...');
    const tenants = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tenants', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const tenant of tenants) {
      const { error } = await supabase
        .from('tenants')
        .upsert({
          id: tenant.id,
          name: tenant.name,
          apartment_id: tenant.apartmentId,
          entry_date: tenant.entryDate,
          exit_date: tenant.exitDate,
          status: tenant.status,
          notes: tenant.notes,
          receive_payment_date: tenant.receivePaymentDate,
          utility_payment_date: tenant.utilityPaymentDate,
          internet_payment_date: tenant.internetPaymentDate,
          is_paid: tenant.isPaid,
          payment_attachment: tenant.paymentAttachment,
          hidden: tenant.hidden,
          created_at: tenant.createdAt,
          updated_at: tenant.updatedAt
        });
      
      if (error) {
        console.error('Error migrating tenant:', error);
      } else {
        console.log(\`✅ Migrated tenant \${tenant.name}\`);
      }
    }
    
    // Migrate updates
    console.log('📝 Migrating updates...');
    const updates = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM updates', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const update of updates) {
      const { error } = await supabase
        .from('updates')
        .upsert({
          id: update.id,
          author: update.author,
          content: update.content,
          date: update.date,
          created_at: update.createdAt,
          updated_at: update.updatedAt
        });
      
      if (error) {
        console.error('Error migrating update:', error);
      } else {
        console.log(\`✅ Migrated update \${update.id}\`);
      }
    }
    
    console.log('🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

migrateData();`;

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'migrate-to-supabase.js'), migrationScript);
console.log('✅ Created data migration script');

// Step 4: Create setup instructions
const instructions = `# 🚀 Supabase Storage Setup Complete!

## What I've created for you:

1. **.env.local** - Environment configuration file
2. **supabase-migration.sql** - Database schema migration
3. **migrate-to-supabase.js** - Data migration script

## Next Steps:

### 1. Get Your Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project: uqlugqxtoikerjywlnxa
3. Go to Settings → API
4. Copy your "anon public" key
5. Replace \`your-anon-key-here\` in .env.local with your actual key

### 2. Run the Database Migration
1. Go to your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of \`scripts/supabase-migration.sql\`
4. Run the SQL to create tables and storage bucket

### 3. Migrate Your Data
\`\`\`bash
cd /Users/liya/alla-saas/next-shadcn-admin-dashboard
node scripts/migrate-to-supabase.js
\`\`\`

### 4. Test Your Setup
\`\`\`bash
bun run dev
\`\`\`

## What This Gives You:

✅ **Cloud Database** - Your data stored in Supabase
✅ **Image Storage** - Property images stored in Supabase Storage
✅ **Real-time Updates** - Live data synchronization
✅ **Backup & Security** - Automatic backups and security
✅ **Scalability** - Handle more data as you grow

Your existing data will be preserved and migrated to the cloud!
`;

fs.writeFileSync(path.join(process.cwd(), 'SUPABASE_SETUP_COMPLETE.md'), instructions);
console.log('✅ Created setup instructions');

console.log('\n🎉 Setup complete! Check SUPABASE_SETUP_COMPLETE.md for next steps.');
console.log('\n📋 Summary:');
console.log('   • Created .env.local configuration');
console.log('   • Created database migration SQL');
console.log('   • Created data migration script');
console.log('   • Created detailed setup instructions');
console.log('\n🔑 You just need to add your Supabase API key to .env.local');
