import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for property images
export const PROPERTY_IMAGES_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'property-images';

// Storage configuration constants
export const STORAGE_CONFIG = {
  BUCKET_NAME: PROPERTY_IMAGES_BUCKET,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  FOLDER_PREFIX: 'properties',
} as const;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here' &&
    supabaseUrl.includes('supabase.co')
  );
};

// Helper function to get storage URL
export const getStorageUrl = (path: string): string => {
  const { data } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};
