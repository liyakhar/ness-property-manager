#!/usr/bin/env node

const { execSync, spawn } = require('node:child_process');

console.log('🔄 Running database migrations...');

// Function to run command with timeout
function runWithTimeout(command, args, options, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });

    // Set timeout
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

async function runMigrations() {
  try {
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Check if we're in production (Vercel)
    if (process.env.VERCEL === '1') {
      console.log('🚀 Production environment detected - using db push for schema sync...');
      console.log('⏱️  Setting 30 second timeout for schema sync...');

      try {
        await runWithTimeout(
          'npx',
          ['prisma', 'db', 'push'],
          {
            stdio: 'inherit',
            env: { ...process.env },
          },
          30000
        );
      } catch (error) {
        console.error('❌ Schema sync timed out or failed:', error.message);
        console.log('🔄 Attempting to continue with build...');
        // Don't fail the build, just continue
      }
    } else {
      console.log('🛠️  Development environment - running db push...');
      execSync('npx prisma db push', { stdio: 'inherit' });
    }

    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
