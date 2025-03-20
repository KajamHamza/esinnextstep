
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/onboarding/FileUpload';
import { useFileUpload } from '@/hooks/use-file-upload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CompanyLogoStep = () => {
  const { setEmployerStep } = useOnboarding();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    uploadFile, 
    isUploading, 
    progress, 
    error 
  } = useFileUpload({ 
    bucketName: 'company_logos', 
    fileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] 
  });

  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('employer_profiles')
          .select('logo_url')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        if (data && data.logo_url) {
          setLogoUrl(data.logo_url);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching logo",
          description: error.message,
        });
      }
    };

    fetchLogoUrl();
  }, [navigate, toast]);

  const handleFileUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadFile(file);
      
      if (uploadedUrl) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const { error } = await supabase
          .from('employer_profiles')
          .update({ logo_url: uploadedUrl })
          .eq('id', session.user.id);

        if (error) throw error;

        setLogoUrl(uploadedUrl);
        
        toast({
          title: "Logo uploaded",
          description: "Your company logo has been successfully uploaded.",
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
    setLogoUrl(null);
  };

  const handleSkip = () => {
    setEmployerStep('company-details');
  };

  const handleContinue = () => {
    setEmployerStep('company-details');
  };

  return (
    <div className="space-y-6">
      <FileUpload
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        uploadProgress={progress}
        uploadError={error}
        filePreview={logoUrl}
        label="Upload your company logo"
        description="Add your company logo to make your profile more professional and recognizable."
        buttonText="Upload Logo"
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
