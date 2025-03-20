import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Employer profile type
interface EmployerProfile {
  id: string;
  company_name: string;
  company_description: string | null;
  industry: string | null;
  company_size: string | null;
  // Other fields omitted for brevity
}

export const CompanyInfoStep = () => {
  const { setEmployerStep } = useOnboarding();
  const [profile, setProfile] = useState<Partial<EmployerProfile>>({
    company_name: '',
    company_description: '',
    industry: '',
    company_size: ''
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
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setProfile({
            company_name: data.company_name || '',
            company_description: data.company_description || '',
            industry: data.industry || '',
            company_size: data.company_size || ''
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

  const handleSelectChange = (value: string, field: string) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handleSubmit = async () => {
    if (!profile.company_name) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Company name is required.",
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
        .from('employer_profiles')
        .update({
          company_name: profile.company_name,
          company_description: profile.company_description,
          industry: profile.industry,
          company_size: profile.company_size
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Company information updated",
        description: "Your company information has been saved.",
      });

      setEmployerStep('company-logo');
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
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input 
            id="company_name" 
            name="company_name" 
            value={profile.company_name || ''} 
            onChange={handleChange} 
            placeholder="Your company name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={profile.industry || ''}
            onValueChange={(value) => handleSelectChange(value, 'industry')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="media">Media & Entertainment</SelectItem>
              <SelectItem value="nonprofit">Nonprofit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size</Label>
          <Select
            value={profile.company_size || ''}
            onValueChange={(value) => handleSelectChange(value, 'company_size')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501-1000">501-1000 employees</SelectItem>
              <SelectItem value="1001+">1001+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_description">Company Description</Label>
          <Textarea 
            id="company_description" 
            name="company_description" 
            value={profile.company_description || ''} 
            onChange={handleChange} 
            placeholder="Tell job seekers about your company mission, vision, and culture"
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
