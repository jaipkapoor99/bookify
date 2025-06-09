import { supabase } from '@/SupabaseClient';

export interface UploadImageOptions {
  file: File;
  bucket?: string;
  folder?: string;
}

export async function uploadImage({ 
  file, 
  bucket = 'event-images',
  folder = 'events' 
}: UploadImageOptions): Promise<{ path: string | null; error: Error | null }> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        path: null, 
        error: new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.') 
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        path: null, 
        error: new Error('File size exceeds 5MB limit.') 
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { path: null, error };
    }

    return { path: data.path, error: null };
  } catch (error) {
    return { 
      path: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

export async function getImageUrl(path: string, bucket = 'event-images'): Promise<string | null> {
  if (!path) return null;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteImage(path: string, bucket = 'event-images'): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}