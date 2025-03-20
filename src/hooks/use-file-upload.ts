
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UploadOptions {
  bucketName: string;
  fileTypes?: string[];
  maxSizeMB?: number;
}

export function useFileUpload({ bucketName, fileTypes = ['image/jpeg', 'image/png', 'image/webp'], maxSizeMB = 5 }: UploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    // Reset states
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file type
      if (fileTypes.length > 0 && !fileTypes.includes(file.type)) {
        throw new Error(`File type not supported. Please upload: ${fileTypes.join(', ')}`);
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File size exceeds the ${maxSizeMB}MB limit`);
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setProgress(100);
      return publicUrl;
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error,
  };
}
