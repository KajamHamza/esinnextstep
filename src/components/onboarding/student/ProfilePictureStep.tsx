/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { FileUpload } from '@/components/onboarding/FileUpload';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ProfilePictureStep = () => {
  const { setStudentStep } = useOnboarding();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    uploadFile, 
    isUploading, 
    progress, 
    error 
  } = useFileUpload({ 
    bucketName: 'avatars', 
    fileTypes: ['image/jpeg', 'image/png', 'image/webp'] 
  });

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // Check if profile exists first
        const { data, error } = await supabase
          .from('student_profiles')
          .select('profile_image_url')
          .eq('id', session.user.id)
          .single();

        if (error) {
          // If error is "no rows found", create a basic profile
          if (error.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('student_profiles')
              .insert({
                id: session.user.id,
                xp_points: 0,
                skills: []
              });
            
            if (createError) throw createError;
          } else {
            throw error;
          }
        } else if (data && data.profile_image_url) {
          setProfileImageUrl(data.profile_image_url);
        }
      } catch (error: any) {
        // Only show errors for actual issues, not for first-time users
        if (error.code !== 'PGRST116') {
          toast({
            variant: "destructive",
            title: "Error fetching profile",
            description: error.message,
          });
        }
        console.error("Error in profile picture step:", error.message);
      }
    };

    fetchProfileImage();
  }, [navigate, toast]);

  const handleFileUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadFile(file);
      
      if (uploadedUrl) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const { error } = await supabase
          .from('student_profiles')
          .update({ profile_image_url: uploadedUrl })
          .eq('id', session.user.id);

        if (error) throw error;

        setProfileImageUrl(uploadedUrl);
        
        toast({
          title: "Profile picture uploaded",
          description: "Your profile picture has been successfully uploaded.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    }
  };

  const resetUpload = () => {
    setProfileImageUrl(null);
  };

  const handleSkip = () => {
    setStudentStep('github');
  };

  const handleContinue = () => {
    setStudentStep('github');
  };

  return (
    <div className="space-y-6">
      <FileUpload
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        uploadProgress={progress}
        uploadError={error}
        filePreview={profileImageUrl}
        label="Upload your profile picture"
        description="Add a professional photo to help employers recognize you."
        buttonText="Upload Photo"
        resetUpload={resetUpload}
      />

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button onClick={handleContinue} disabled={isUploading}>
          Continue
        </Button>
      </div>
    </div>
  );
};
