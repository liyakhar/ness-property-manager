# Supabase Storage Setup Guide

## 🗄️ Setting up Supabase Storage for Property Images

Your app is now configured to use Supabase Storage for image uploads instead of storing Base64 strings in the database.

### 📋 Prerequisites

1. **Supabase Project**: You already have this set up
2. **Environment Variables**: Already configured in Vercel

### 🔧 Supabase Storage Setup

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to "Storage" in the left sidebar

2. **Create a Storage Bucket**
   - Click "New Bucket"
   - Name: `property-images`
   - Make it **Public** (so images can be accessed via URL)
   - Click "Create Bucket"

3. **Set up RLS (Row Level Security) Policies**
   - Go to "Storage" → "Policies"
   - Create a new policy for the `property-images` bucket:

   **Policy Name**: `Allow public read access`
   **Policy Definition**:
   ```sql
   (bucket_id = 'property-images'::text)
   ```

   **Policy Name**: `Allow authenticated uploads`
   **Policy Definition**:
   ```sql
   (bucket_id = 'property-images'::text) AND (auth.role() = 'authenticated')
   ```

### 🚀 How It Works

1. **Image Upload Flow**:
   - User selects images in the PropertyImagesCell component
   - Images are uploaded to Supabase Storage via `/api/upload-image`
   - Images are stored in `property-images/{propertyId}/{timestamp}.{ext}` format
   - Public URLs are returned and stored in the database

2. **Image Storage**:
   - Images are stored in Supabase Storage (not in database)
   - Database only stores the public URLs
   - Much more efficient than Base64 storage

3. **Image Deletion**:
   - When images are removed, they're deleted from Supabase Storage
   - Database is updated to remove the URL

### 🧪 Testing

1. **Deploy to Vercel** (recommended):
   ```bash
   git add .
   git commit -m "Add Supabase Storage for images"
   git push
   ```

2. **Or test locally**:
   ```bash
   # Set up DATABASE_URL in .env.local
   echo "DATABASE_URL=your_postgres_prisma_url" > .env.local
   
   # Run migration
   npx prisma migrate dev --name add_images_field
   
   # Start development server
   bun run dev
   ```

### 📁 File Structure

```
property-images/
├── {propertyId1}/
│   ├── 1703123456789.jpg
│   └── 1703123456790.png
├── {propertyId2}/
│   └── 1703123456791.jpg
└── ...
```

### 🔍 Troubleshooting

- **Upload fails**: Check Supabase Storage policies
- **Images not showing**: Verify bucket is public
- **Database errors**: Ensure migration ran successfully

### ✅ Benefits

- **Efficient**: No more Base64 strings in database
- **Scalable**: Supabase handles CDN and optimization
- **Persistent**: Images survive deployments
- **Fast**: Images load quickly via CDN
