# Supabase Setup Instructions

## 🚨 Issue Identified
The image upload is failing with a 500 error because the Supabase environment variables are not configured.

## 🔧 Solution

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key-here

# Database Configuration (if using Prisma)
DATABASE_URL="file:./dev.db"
```

### 3. Set Up Supabase Storage

1. In your Supabase Dashboard, go to **Storage**
2. Create a new bucket named `property-images`
3. Make it **Public** (so images can be accessed via URL)
4. Set up RLS policies:

**Policy 1: Allow public read access**
```sql
(bucket_id = 'property-images'::text)
```

**Policy 2: Allow authenticated uploads**
```sql
(bucket_id = 'property-images'::text) AND (auth.role() = 'authenticated')
```

### 4. Test the Setup

1. Restart your development server:
   ```bash
   bun run dev
   ```

2. Try uploading an image in the property management section

3. Check the browser console and server logs for any errors

## 🔍 Debugging

If you still get errors, check:

1. **Environment Variables**: Make sure `.env.local` is in the project root
2. **Supabase Bucket**: Ensure the `property-images` bucket exists and is public
3. **RLS Policies**: Verify the storage policies are set up correctly
4. **File Types**: Only upload image files (jpg, png, webp, gif, svg)
5. **File Size**: Keep files under 10MB

## 📝 What Was Fixed

- Added proper error handling for missing Supabase configuration
- Added file type validation (only images allowed)
- Added file size validation (10MB limit)
- Added detailed logging for debugging
- Created setup instructions for Supabase configuration

The upload API will now provide clear error messages instead of generic 500 errors.

