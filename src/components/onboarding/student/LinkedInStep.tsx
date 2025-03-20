/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Linkedin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const LinkedInStep = () => {
  const { setStudentStep } = useOnboarding();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLinkedInInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // Check if profile exists
        const { data, error } = await supabase
          .from('student_profiles')
          .select('linkedin_url')
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
        } else if (data && data.linkedin_url) {
          setLinkedinUrl(data.linkedin_url);
        }
      } catch (error: any) {
        // Only show toast for actual errors, not for first-time setup
        if (error.code !== 'PGRST116') {
          console.error("Error fetching LinkedIn info:", error.message);
        }
      }
    };

    fetchLinkedInInfo();
  }, [navigate, toast]);

  const validateLinkedInUrl = (url: string) => {
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    return linkedinRegex.test(url);
  };

  const handleSave = async () => {
    if (linkedinUrl && !validateLinkedInUrl(linkedinUrl)) {
      toast({
        variant: "destructive",
        title: "Invalid LinkedIn URL",
        description: "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username).",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('student_profiles')
        .update({
          linkedin_url: linkedinUrl
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "LinkedIn info saved",
        description: "Your LinkedIn profile URL has been saved.",
      });

      setStudentStep('resume');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving LinkedIn info",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setStudentStep('resume');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Connect your LinkedIn</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your LinkedIn profile URL to connect with employers and showcase your professional experience.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Linkedin className="h-8 w-8 text-[#0077B5]" />
            <p className="text-sm font-medium">LinkedIn Profile</p>
          </div>
          
          <Input
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
          
          <p className="text-xs text-muted-foreground">
            Enter your LinkedIn profile URL to enhance your profile and connect with potential employers.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          Continue
        </Button>
      </div>
    </div>
  );
};
