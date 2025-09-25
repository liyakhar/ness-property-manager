#!/usr/bin/env node

/**
 * Migrate data from SQLite to Free JSON Storage
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import the free storage functions
const { freeStorage } = require('../src/lib/free-storage.ts');

async function migrateData() {
  console.log('🔄 Starting migration from SQLite to Free JSON Storage...\n');
  
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
      try {
        const migratedProperty = freeStorage.properties.create({
          apartmentNumber: property.apartmentNumber,
          location: property.location,
          rooms: property.rooms,
          readinessStatus: property.readinessStatus,
          propertyType: property.propertyType,
          occupancyStatus: property.occupancyStatus,
          apartmentContents: property.apartmentContents,
          urgentMatter: property.urgentMatter,
          images: property.images ? [property.images] : [],
        });
        console.log(`✅ Migrated property ${property.apartmentNumber} (${migratedProperty.id})`);
      } catch (error) {
        console.error(`❌ Error migrating property ${property.apartmentNumber}:`, error.message);
      }
    }
    
    // Migrate tenants
    console.log('\n👥 Migrating tenants...');
    const tenants = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tenants', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const tenant of tenants) {
      try {
        const migratedTenant = freeStorage.tenants.create({
          name: tenant.name,
          apartmentId: tenant.apartmentId,
          entryDate: tenant.entryDate,
          exitDate: tenant.exitDate,
          status: tenant.status,
          notes: tenant.notes,
          receivePaymentDate: tenant.receivePaymentDate,
          utilityPaymentDate: tenant.utilityPaymentDate,
          internetPaymentDate: tenant.internetPaymentDate,
          isPaid: tenant.isPaid,
          paymentAttachment: tenant.paymentAttachment,
          hidden: tenant.hidden,
        });
        console.log(`✅ Migrated tenant ${tenant.name} (${migratedTenant.id})`);
      } catch (error) {
        console.error(`❌ Error migrating tenant ${tenant.name}:`, error.message);
      }
    }
    
    // Migrate updates
    console.log('\n📝 Migrating updates...');
    const updates = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM updates', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const update of updates) {
      try {
        const migratedUpdate = freeStorage.updates.create({
          author: update.author,
          content: update.content,
          date: update.date,
        });
        console.log(`✅ Migrated update ${update.id} (${migratedUpdate.id})`);
      } catch (error) {
        console.error(`❌ Error migrating update ${update.id}:`, error.message);
      }
    }
    
    // Show final statistics
    const stats = freeStorage.stats();
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Final Statistics:');
    console.log(`   • Properties: ${stats.properties}`);
    console.log(`   • Tenants: ${stats.tenants}`);
    console.log(`   • Updates: ${stats.updates}`);
    console.log(`   • Images: ${stats.images}`);
    console.log(`   • Total Size: ${formatBytes(stats.totalSize)}`);
    
    console.log('\n📁 Data stored in:');
    console.log(`   • Properties: data/properties.json`);
    console.log(`   • Tenants: data/tenants.json`);
    console.log(`   • Updates: data/updates.json`);
    console.log(`   • Images: data/images/`);
    
    console.log('\n🚀 Your data is now stored in free JSON files!');
    console.log('   No external services required - everything is local and free!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run migration
migrateData().catch(console.error);
