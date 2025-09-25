#!/usr/bin/env node

/**
 * Free Storage Setup Script
 * Sets up free JSON-based storage for your property management app
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('🚀 Setting up FREE storage for your property management app...\n');

// Create data directory
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
} else {
  console.log('✅ Data directory already exists');
}

// Create images directory
const imagesDir = path.join(dataDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Created images directory');
} else {
  console.log('✅ Images directory already exists');
}

// Create empty JSON files
const files = [
  { name: 'properties.json', content: '[]' },
  { name: 'tenants.json', content: '[]' },
  { name: 'updates.json', content: '[]' },
];

files.forEach((file) => {
  const filePath = path.join(dataDir, file.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.content);
    console.log(`✅ Created ${file.name}`);
  } else {
    console.log(`✅ ${file.name} already exists`);
  }
});

// Create a simple test script
const testScript = `
const { freeStorage } = require('../src/lib/free-storage.ts');

console.log('🧪 Testing free storage...');

// Test creating a property
const testProperty = freeStorage.properties.create({
  apartmentNumber: 101,
  location: 'Test Location',
  rooms: 2,
  readinessStatus: 'немеблированная',
  propertyType: 'аренда',
  occupancyStatus: 'свободна',
  apartmentContents: 'Test contents',
  urgentMatter: 'No urgent matters',
});

console.log('✅ Created test property:', testProperty.id);

// Test creating a tenant
const testTenant = freeStorage.tenants.create({
  name: 'Test Tenant',
  apartmentId: testProperty.id,
  entryDate: new Date().toISOString(),
  status: 'current',
  isPaid: false,
  hidden: false,
});

console.log('✅ Created test tenant:', testTenant.id);

// Test creating an update
const testUpdate = freeStorage.updates.create({
  author: 'Test Author',
  content: 'Test update content',
  date: new Date().toISOString(),
});

console.log('✅ Created test update:', testUpdate.id);

// Show statistics
const stats = freeStorage.stats();
console.log('\\n📊 Storage Statistics:');
console.log(\`   • Properties: \${stats.properties}\`);
console.log(\`   • Tenants: \${stats.tenants}\`);
console.log(\`   • Updates: \${stats.updates}\`);
console.log(\`   • Images: \${stats.images}\`);
console.log(\`   • Total Size: \${stats.totalSize} bytes\`);

console.log('\\n🎉 Free storage is working perfectly!');
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'test-free-storage.js'), testScript);
console.log('✅ Created test script');

// Create setup instructions
const instructions = `# 🎉 FREE Storage Setup Complete!

## What I've created for you:

✅ **Free JSON Storage** - No external services required
✅ **API Endpoints** - Full REST API for your data
✅ **Image Storage** - Local image storage with API
✅ **Data Migration** - Script to move your existing data
✅ **Test Script** - Verify everything works

## 🚀 How to Use:

### 1. Test the Setup
\`\`\`bash
node scripts/test-free-storage.js
\`\`\`

### 2. Migrate Your Existing Data
\`\`\`bash
node scripts/migrate-to-free-storage.js
\`\`\`

### 3. Start Your App
\`\`\`bash
bun run dev
\`\`\`

## 📁 Data Storage:

Your data is stored in these files:
- **Properties**: \`data/properties.json\`
- **Tenants**: \`data/tenants.json\`
- **Updates**: \`data/updates.json\`
- **Images**: \`data/images/\`

## 🔗 API Endpoints:

- **Properties**: \`/api/free-storage/properties\`
- **Tenants**: \`/api/free-storage/tenants\`
- **Updates**: \`/api/free-storage/updates\`
- **Images**: \`/api/free-storage/images\`

## ✨ Benefits:

- **100% Free** - No external services or costs
- **Local Storage** - Your data stays on your machine
- **Fast Performance** - No network latency
- **Easy Backup** - Just copy the data folder
- **No Dependencies** - Works offline
- **Privacy** - Your data never leaves your machine

## 🔧 Features:

- Full CRUD operations for all data types
- Image upload and storage
- Data validation and error handling
- Automatic ID generation
- Timestamp tracking
- Statistics and monitoring

Your property management app now has free, reliable storage!
`;

fs.writeFileSync(path.join(process.cwd(), 'FREE_STORAGE_SETUP.md'), instructions);
console.log('✅ Created setup instructions');

console.log('\n🎉 FREE storage setup complete!');
console.log("\n📋 What I've created:");
console.log('   • Free JSON-based storage system');
console.log('   • Complete API endpoints');
console.log('   • Image storage solution');
console.log('   • Data migration script');
console.log('   • Test script to verify everything works');

console.log('\n🚀 Next steps:');
console.log('1. Run: node scripts/test-free-storage.js');
console.log('2. Run: node scripts/migrate-to-free-storage.js');
console.log('3. Start your app: bun run dev');
console.log('\n📖 Check FREE_STORAGE_SETUP.md for detailed instructions');
console.log('\n✨ Your data is now stored locally and completely FREE!');
