#!/usr/bin/env node

/**
 * Test script for image storage configuration
 * Run with: node scripts/test-image-storage.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Image Storage Configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create .env.local using the env.template file');
  console.log('   cp env.template .env.local');
  console.log('   Then edit .env.local with your Supabase credentials\n');
  process.exit(1);
}

// Read and check environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach((line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

console.log('📋 Environment Variables Check:');

// Check required variables
const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'DATABASE_URL'];

let allPresent = true;

requiredVars.forEach((varName) => {
  if (envVars[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allPresent = false;
  }
});

// Check optional variables
const optionalVars = ['NEXT_PUBLIC_STORAGE_BUCKET'];
optionalVars.forEach((varName) => {
  if (envVars[varName]) {
    console.log(`✅ ${varName}: ${envVars[varName]}`);
  } else {
    console.log(`ℹ️  ${varName}: Using default (property-images)`);
  }
});

console.log('\n📁 File Structure Check:');

// Check if required files exist
const requiredFiles = [
  'src/lib/supabase.ts',
  'src/lib/image-storage.ts',
  'src/app/api/upload-image/route.ts',
  'IMAGE_STORAGE_SETUP.md',
];

requiredFiles.forEach((filePath) => {
  if (fs.existsSync(path.join(process.cwd(), filePath))) {
    console.log(`✅ ${filePath}: Exists`);
  } else {
    console.log(`❌ ${filePath}: Missing`);
    allPresent = false;
  }
});

console.log('\n📦 Package Dependencies Check:');

// Check package.json for required dependencies
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = ['@supabase/supabase-js'];
  requiredDeps.forEach((dep) => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: Missing - run "bun add @supabase/supabase-js"`);
      allPresent = false;
    }
  });
} else {
  console.log('❌ package.json not found');
  allPresent = false;
}

console.log('\n🎯 Next Steps:');

if (allPresent) {
  console.log('✅ Configuration looks good!');
  console.log('📖 Read IMAGE_STORAGE_SETUP.md for detailed setup instructions');
  console.log('🚀 Start your dev server: bun run dev');
  console.log('🧪 Test image upload in the property management section');
} else {
  console.log('❌ Some configuration is missing');
  console.log('📖 Follow the setup guide in IMAGE_STORAGE_SETUP.md');
  console.log('🔧 Fix the issues above and run this script again');
}

console.log('\n📚 Documentation:');
console.log('   - Setup Guide: IMAGE_STORAGE_SETUP.md');
console.log('   - Environment Template: env.template');
console.log('   - Supabase Dashboard: https://supabase.com/dashboard');
