#!/usr/bin/env node

/**
 * Simple Migration Script
 * Migrates data from SQLite to Free JSON Storage
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Simple JSON storage functions
const dataDir = path.join(process.cwd(), 'data');
const propertiesFile = path.join(dataDir, 'properties.json');
const tenantsFile = path.join(dataDir, 'tenants.json');
const updatesFile = path.join(dataDir, 'updates.json');

// Read JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write JSON file
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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
    
    const existingProperties = readJsonFile(propertiesFile);
    
    for (const property of properties) {
      const migratedProperty = {
        id: generateId('prop'),
        apartmentNumber: property.apartmentNumber,
        location: property.location,
        rooms: property.rooms,
        readinessStatus: property.readinessStatus,
        propertyType: property.propertyType,
        occupancyStatus: property.occupancyStatus,
        apartmentContents: property.apartmentContents,
        urgentMatter: property.urgentMatter,
        images: property.images ? [property.images] : [],
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
      
      existingProperties.push(migratedProperty);
      console.log(`✅ Migrated property ${property.apartmentNumber} (${migratedProperty.id})`);
    }
    
    writeJsonFile(propertiesFile, existingProperties);
    
    // Migrate tenants
    console.log('\n👥 Migrating tenants...');
    const tenants = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tenants', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const existingTenants = readJsonFile(tenantsFile);
    
    for (const tenant of tenants) {
      const migratedTenant = {
        id: generateId('tenant'),
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
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      };
      
      existingTenants.push(migratedTenant);
      console.log(`✅ Migrated tenant ${tenant.name} (${migratedTenant.id})`);
    }
    
    writeJsonFile(tenantsFile, existingTenants);
    
    // Migrate updates
    console.log('\n📝 Migrating updates...');
    const updates = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM updates', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const existingUpdates = readJsonFile(updatesFile);
    
    for (const update of updates) {
      const migratedUpdate = {
        id: generateId('update'),
        author: update.author,
        content: update.content,
        date: update.date,
        createdAt: update.createdAt,
        updatedAt: update.updatedAt,
      };
      
      existingUpdates.push(migratedUpdate);
      console.log(`✅ Migrated update ${update.id} (${migratedUpdate.id})`);
    }
    
    writeJsonFile(updatesFile, existingUpdates);
    
    // Show final statistics
    const finalProperties = readJsonFile(propertiesFile);
    const finalTenants = readJsonFile(tenantsFile);
    const finalUpdates = readJsonFile(updatesFile);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Final Statistics:');
    console.log(`   • Properties: ${finalProperties.length}`);
    console.log(`   • Tenants: ${finalTenants.length}`);
    console.log(`   • Updates: ${finalUpdates.length}`);
    
    console.log('\n📁 Data stored in:');
    console.log(`   • Properties: data/properties.json`);
    console.log(`   • Tenants: data/tenants.json`);
    console.log(`   • Updates: data/updates.json`);
    
    console.log('\n🚀 Your data is now stored in free JSON files!');
    console.log('   No external services required - everything is local and free!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

// Run migration
migrateData().catch(console.error);
