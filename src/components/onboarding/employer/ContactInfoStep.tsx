
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface SocialLinks {
  linkedin: string;
  twitter: string;
  facebook: string;
}

interface ContactInfo {
  contact_email: string;
  contact_phone: string;
  social_links: SocialLinks;
}

export const ContactInfoStep = () => {
  const { setEmployerStep } = useOnboarding();
  const [profile, setProfile] = useState<ContactInfo>({
    contact_email: '',
    contact_phone: '',
    social_links: {
      linkedin: '',
      twitter: '',
      facebook: ''
    }
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
          .from('employer_profiles')
          .select('contact_email, contact_phone, social_links')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          // Initialize with default empty social_links if not present or not in correct format
          const socialLinks: SocialLinks = { linkedin: '', twitter: '', facebook: '' };
          
          // Only update social_links if it exists and is an object
          if (data.social_links && typeof data.social_links === 'object' && !Array.isArray(data.social_links)) {
            const socialLinksData = data.social_links as Record<string, Json>;
            
            // Safely copy properties
            if (typeof socialLinksData.linkedin === 'string') {
              socialLinks.linkedin = socialLinksData.linkedin;
            }
            if (typeof socialLinksData.twitter === 'string') {
              socialLinks.twitter = socialLinksData.twitter;
            }
            if (typeof socialLinksData.facebook === 'string') {
              socialLinks.facebook = socialLinksData.facebook;
            }
          }
          
          setProfile({
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            social_links: socialLinks
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialNetwork = name.replace('social_', '') as keyof SocialLinks;
      setProfile({
        ...profile,
        social_links: {
          ...profile.social_links,
          [socialNetwork]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSubmit = async () => {
    if (!profile.contact_email) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Contact email is required.",
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

      // Convert social_links to a format that Supabase can store as JSON
      const socialLinksJson: Record<string, string> = {
        linkedin: profile.social_links.linkedin,
        twitter: profile.social_links.twitter,
        facebook: profile.social_links.facebook
      };

      const { error } = await supabase
        .from('employer_profiles')
        .update({
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone,
          social_links: socialLinksJson
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Update onboarding status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Contact information saved",
        description: "Your contact information has been saved. Onboarding complete!",
      });

      setEmployerStep('completed');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating contact info",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email *</Label>
          <div className="flex items-center">
            <Mail className="mr-2 h-4 w-4 text-gray-400" />
            <Input 
              id="contact_email" 
              name="contact_email" 
              type="email"
              value={profile.contact_email} 
              onChange={handleChange} 
              placeholder="contact@yourcompany.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <div className="flex items-center">
            <Phone className="mr-2 h-4 w-4 text-gray-400" />
            <Input 
              id="contact_phone" 
              name="contact_phone" 
              value={profile.contact_phone} 
              onChange={handleChange} 
              placeholder="+1 (123) 456-7890"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Social Media</Label>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="mr-2 bg-[#0077B5] text-white p-1 rounded-md">in</span>
              <Input 
                id="social_linkedin" 
                name="social_linkedin" 
                value={profile.social_links.linkedin} 
                onChange={handleChange} 
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 bg-[#1DA1F2] text-white p-1 rounded-md">X</span>
              <Input 
                id="social_twitter" 
                name="social_twitter" 
                value={profile.social_links.twitter} 
                onChange={handleChange} 
                placeholder="https://twitter.com/yourcompany"
              />
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 bg-[#1877F2] text-white p-1 rounded-md">f</span>
              <Input 
                id="social_facebook" 
                name="social_facebook" 
                value={profile.social_links.facebook} 
                onChange={handleChange} 
                placeholder="https://facebook.com/yourcompany"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Complete Profile'}
        </Button>
      </div>
    </div>
  );
};
