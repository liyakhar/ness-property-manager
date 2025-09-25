const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

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
      const { error } = await supabase.from('properties').upsert({
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
        updated_at: property.updatedAt,
      });

      if (error) {
        console.error('Error migrating property:', error);
      } else {
        console.log(`✅ Migrated property ${property.apartmentNumber}`);
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
      const { error } = await supabase.from('tenants').upsert({
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
        updated_at: tenant.updatedAt,
      });

      if (error) {
        console.error('Error migrating tenant:', error);
      } else {
        console.log(`✅ Migrated tenant ${tenant.name}`);
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
      const { error } = await supabase.from('updates').upsert({
        id: update.id,
        author: update.author,
        content: update.content,
        date: update.date,
        created_at: update.createdAt,
        updated_at: update.updatedAt,
      });

      if (error) {
        console.error('Error migrating update:', error);
      } else {
        console.log(`✅ Migrated update ${update.id}`);
      }
    }

    console.log('🎉 Data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

migrateData();
