#!/usr/bin/env node

const { execSync } = require('node:child_process');

console.log('🔄 Running database migrations...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Check if we're in production (Vercel)
  if (process.env.VERCEL === '1') {
    console.log('🚀 Production environment detected - running migrate deploy...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } else {
    console.log('🛠️  Development environment - running migrate dev...');
    // For development, we'll use db push for now since we don't have migrations yet
    execSync('npx prisma db push', { stdio: 'inherit' });
  }

  console.log('✅ Database migrations completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
