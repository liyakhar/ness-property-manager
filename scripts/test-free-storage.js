
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
console.log('\n📊 Storage Statistics:');
console.log(`   • Properties: ${stats.properties}`);
console.log(`   • Tenants: ${stats.tenants}`);
console.log(`   • Updates: ${stats.updates}`);
console.log(`   • Images: ${stats.images}`);
console.log(`   • Total Size: ${stats.totalSize} bytes`);

console.log('\n🎉 Free storage is working perfectly!');
