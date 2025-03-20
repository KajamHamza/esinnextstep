/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudentProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  education: string | null;
  skills: string[] | null;
  profile_image_url: string | null;
  resume_url: string | null;
  github_username: string | null;
  linkedin_url: string | null;
  github_projects: any[] | null;
}

export const BasicInfoStep = () => {
  const { setStudentStep } = useOnboarding();
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    first_name: '',
    last_name: '',
    bio: '',
    education: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            bio: data.bio || '',
            education: data.education || ''
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!profile.first_name || !profile.last_name) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "First name and last name are required.",
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
          first_name: profile.first_name,
          last_name: profile.last_name,
          bio: profile.bio,
          education: profile.education
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your basic information has been saved.",
      });

      setStudentStep('profile-picture');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input 
              id="first_name" 
              name="first_name" 
              value={profile.first_name || ''} 
              onChange={handleChange} 
              placeholder="Your first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input 
              id="last_name" 
              name="last_name" 
              value={profile.last_name || ''} 
              onChange={handleChange} 
              placeholder="Your last name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Education</Label>
          <Input 
            id="education" 
            name="education" 
            value={profile.education || ''} 
            onChange={handleChange} 
            placeholder="Your education (e.g., Bachelor's in Computer Science)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea 
            id="bio" 
            name="bio" 
            value={profile.bio || ''} 
            onChange={handleChange} 
            placeholder="Tell employers about yourself (experience, interests, goals)"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
