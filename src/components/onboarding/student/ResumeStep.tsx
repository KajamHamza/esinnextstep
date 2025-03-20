/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { FileUpload } from '@/components/onboarding/FileUpload';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ResumeStep = () => {
  const { setStudentStep } = useOnboarding();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    uploadFile, 
    isUploading, 
    progress, 
    error 
  } = useFileUpload({ 
    bucketName: 'resumes', 
    fileTypes: ['application/pdf'], 
    maxSizeMB: 10 
  });

  useEffect(() => {
    const fetchResumeUrl = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // Check if profile exists
        const { data, error } = await supabase
          .from('student_profiles')
          .select('resume_url')
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
        } else if (data && data.resume_url) {
          setResumeUrl(data.resume_url);
        }
      } catch (error: any) {
        // Only show errors for actual issues, not first-time setup
        if (error.code !== 'PGRST116') {
          toast({
            variant: "destructive",
            title: "Error fetching resume",
            description: error.message,
          });
        }
        console.error("Error in resume step:", error.message);
      }
    };

    fetchResumeUrl();
  }, [navigate, toast]);

  const handleFileUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadFile(file);
      
      if (uploadedUrl) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const { error } = await supabase
          .from('student_profiles')
          .update({ resume_url: uploadedUrl })
          .eq('id', session.user.id);

        if (error) throw error;

        setResumeUrl(uploadedUrl);
        
        toast({
          title: "Resume uploaded",
          description: "Your resume has been successfully uploaded.",
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
    setResumeUrl(null);
  };

  const handleSkip = () => {
    setStudentStep('skills');
  };

  const handleContinue = () => {
    setStudentStep('skills');
  };

  return (
    <div className="space-y-6">
      <FileUpload
        onFileUpload={handleFileUpload}
        accept=".pdf"
        isUploading={isUploading}
        uploadProgress={progress}
        uploadError={error}
        filePreview={resumeUrl}
        label="Upload your resume"
        description="Add your resume to apply for jobs quickly. PDF format preferred."
        buttonText="Upload Resume"
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
