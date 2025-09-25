# 🖼️ Image Storage Configuration Guide

This guide will help you set up Supabase storage for property images in your admin dashboard.

## 📋 Prerequisites

- Supabase account and project
- Admin access to your Supabase project

## 🔧 Step 1: Get Supabase Credentials

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one)

2. **Get API Credentials**
   - Go to **Settings** → **API**
   - Copy the following values:
     - **Project URL** (looks like: `https://your-project-id.supabase.co`)
     - **Anon/Public Key** (starts with `eyJ...`)

## 🔧 Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key-here

# Database Configuration
DATABASE_URL="file:./dev.db"

# Storage Configuration (optional - defaults to 'property-images')
NEXT_PUBLIC_STORAGE_BUCKET=property-images
```

## 🗄️ Step 3: Set Up Supabase Storage

### 3.1 Create Storage Bucket

1. **Go to Storage in Supabase Dashboard**
   - Navigate to **Storage** in the left sidebar
   - Click **"New Bucket"**

2. **Configure Bucket**
   - **Name**: `property-images`
   - **Public**: ✅ **Yes** (so images can be accessed via URL)
   - **File size limit**: 10MB (default)
   - Click **"Create Bucket"**

### 3.2 Set Up RLS (Row Level Security) Policies

1. **Go to Storage Policies**
   - Navigate to **Storage** → **Policies**
   - Select the `property-images` bucket

2. **Create Public Read Policy**
   - Click **"New Policy"**
   - **Policy Name**: `Allow public read access`
   - **Policy Definition**:
   ```sql
   (bucket_id = 'property-images'::text)
   ```
   - **Operation**: `SELECT`
   - Click **"Save"**

3. **Create Upload Policy**
   - Click **"New Policy"**
   - **Policy Name**: `Allow authenticated uploads`
   - **Policy Definition**:
   ```sql
   (bucket_id = 'property-images'::text) AND (auth.role() = 'authenticated')
   ```
   - **Operation**: `INSERT`
   - Click **"Save"**

4. **Create Delete Policy**
   - Click **"New Policy"**
   - **Policy Name**: `Allow authenticated deletes`
   - **Policy Definition**:
   ```sql
   (bucket_id = 'property-images'::text) AND (auth.role() = 'authenticated')
   ```
   - **Operation**: `DELETE`
   - Click **"Save"**

## 🧪 Step 4: Test the Setup

### 4.1 Start Development Server

```bash
# Install dependencies (if not already done)
bun install

# Start development server
bun run dev
```

### 4.2 Test Image Upload

1. **Navigate to Property Management**
   - Go to `/dashboard/property-management`
   - Click on a property to edit it
   - Try uploading an image

2. **Check Console for Errors**
   - Open browser developer tools
   - Look for any error messages in the console
   - Check the Network tab for failed requests

### 4.3 Verify Storage

1. **Check Supabase Storage**
   - Go to **Storage** → **property-images** in Supabase Dashboard
   - You should see uploaded images organized by property ID

2. **Test Image Display**
   - Images should display correctly in the property management interface
   - URLs should be accessible publicly

## 🔍 Troubleshooting

### Common Issues

#### ❌ "Supabase not configured" Error
**Solution**: Make sure `.env.local` exists and contains the correct Supabase credentials.

#### ❌ "Failed to upload file" Error
**Solution**: Check that:
- Storage bucket `property-images` exists
- RLS policies are set up correctly
- Bucket is set to public

#### ❌ Images Not Displaying
**Solution**: Verify that:
- Images are uploaded successfully to Supabase Storage
- Public URLs are being generated correctly
- No CORS issues (Supabase handles this automatically)

#### ❌ "File too large" Error
**Solution**: 
- Current limit is 10MB per file
- To change: Update `STORAGE_CONFIG.MAX_FILE_SIZE` in `src/lib/supabase.ts`

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Check Supabase Connection**
   ```javascript
   // In browser console
   console.log('Supabase configured:', !!window.supabase);
   ```

3. **Check Storage Bucket**
   - Go to Supabase Dashboard → Storage
   - Verify `property-images` bucket exists and is public

## 📁 File Structure

Images are stored in Supabase with the following structure:

```
property-images/
├── {propertyId1}/
│   ├── 1703123456789.jpg
│   └── 1703123456790.png
├── {propertyId2}/
│   └── 1703123456791.jpg
└── ...
```

## ⚙️ Configuration Options

You can customize storage behavior by modifying `src/lib/supabase.ts`:

```typescript
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'property-images',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  FOLDER_PREFIX: 'properties',
} as const;
```

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Storage bucket `property-images` created
- [ ] RLS policies set up (read, upload, delete)
- [ ] Development server running
- [ ] Image upload working
- [ ] Images displaying correctly
- [ ] No console errors

## 🚀 Production Deployment

For production deployment (Vercel, Netlify, etc.):

1. **Set Environment Variables**
   - Add the same environment variables to your deployment platform
   - Make sure they're marked as public (they start with `NEXT_PUBLIC_`)

2. **Verify Storage Policies**
   - Ensure RLS policies are production-ready
   - Consider adding more restrictive policies if needed

3. **Test in Production**
   - Upload images in the production environment
   - Verify images are accessible via public URLs

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Supabase dashboard for storage bucket status
3. Ensure all environment variables are correctly set
4. Check that RLS policies are properly configured

The image storage system is now ready to use! 🎉
