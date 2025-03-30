import { supabase } from './supabase';

// Initialize storage bucket if it doesn't exist
const initStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucket = buckets?.find(b => b.name === 'avatars');

    if (!avatarsBucket) {
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (error) throw error;
      
      // Set bucket policy to allow public access
      await supabase.storage.from('avatars').createSignedUrl('dummy.txt', 3600);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize storage on module load
initStorage();

export const storage = {
  uploadProfilePicture: async (userId: string, file: File) => {
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  deleteProfilePicture: async (url: string) => {
    try {
      // Extract file path from URL
      const path = url.split('/').pop();
      if (!path) throw new Error('Invalid file path');

      const { error } = await supabase.storage
        .from('avatars')
        .remove([`profiles/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};