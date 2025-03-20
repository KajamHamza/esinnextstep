
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Map, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Partial employer profile type for this step
interface PartialEmployerProfile {
  company_location: string;
  company_culture: string;
  company_benefits: string[];
  company_values: string[];
  website_url: string;
}

export const CompanyDetailsStep = () => {
  const { setEmployerStep } = useOnboarding();
  const [profile, setProfile] = useState<Partial<PartialEmployerProfile>>({
    company_location: '',
    company_culture: '',
    company_benefits: [],
    company_values: [],
    website_url: ''
  });
  const [newBenefit, setNewBenefit] = useState('');
  const [newValue, setNewValue] = useState('');
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
          .select('company_location, company_culture, company_benefits, company_values, website_url')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setProfile({
            company_location: data.company_location || '',
            company_culture: data.company_culture || '',
            company_benefits: data.company_benefits || [],
            company_values: data.company_values || [],
            website_url: data.website_url || ''
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

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    
    // Check if benefit already exists
    if (profile.company_benefits?.includes(newBenefit.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate benefit",
        description: "This benefit is already in your list.",
      });
      return;
    }
    
    // Add new benefit
    setProfile({
      ...profile,
      company_benefits: [...(profile.company_benefits || []), newBenefit.trim()]
    });
    setNewBenefit('');
  };

  const removeBenefit = (benefit: string) => {
    setProfile({
      ...profile,
      company_benefits: profile.company_benefits?.filter(b => b !== benefit) || []
    });
  };

  const addValue = () => {
    if (!newValue.trim()) return;
    
    // Check if value already exists
    if (profile.company_values?.includes(newValue.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate value",
        description: "This value is already in your list.",
      });
      return;
    }
    
    // Add new value
    setProfile({
      ...profile,
      company_values: [...(profile.company_values || []), newValue.trim()]
    });
    setNewValue('');
  };

  const removeValue = (value: string) => {
    setProfile({
      ...profile,
      company_values: profile.company_values?.filter(v => v !== value) || []
    });
  };

  const handleBenefitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit();
    }
  };

  const handleValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  const handleSubmit = async () => {
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
          company_location: profile.company_location,
          company_culture: profile.company_culture,
          company_benefits: profile.company_benefits,
          company_values: profile.company_values,
          website_url: profile.website_url
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Company details updated",
        description: "Your company details have been saved.",
      });

      setEmployerStep('contact-info');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating details",
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
          <Label htmlFor="website_url">Company Website</Label>
          <div className="flex items-center">
            <Globe className="mr-2 h-4 w-4 text-gray-400" />
            <Input 
              id="website_url" 
              name="website_url" 
              value={profile.website_url || ''} 
              onChange={handleChange} 
              placeholder="https://www.yourcompany.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_location">Company Location</Label>
          <div className="flex items-center">
            <Map className="mr-2 h-4 w-4 text-gray-400" />
            <Input 
              id="company_location" 
              name="company_location" 
              value={profile.company_location || ''} 
              onChange={handleChange} 
              placeholder="City, State, Country"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_culture">Company Culture</Label>
          <Textarea 
            id="company_culture" 
            name="company_culture" 
            value={profile.company_culture || ''} 
            onChange={handleChange} 
            placeholder="Describe your company culture and work environment"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_benefits">Employee Benefits</Label>
          <div className="flex gap-2">
            <Input
              id="company_benefits"
              placeholder="Add a benefit (e.g., Health Insurance, Remote Work)"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyDown={handleBenefitKeyDown}
            />
            <Button onClick={addBenefit}>Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.company_benefits?.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                {benefit}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => removeBenefit(benefit)}
                />
              </Badge>
            ))}
            
            {(!profile.company_benefits || profile.company_benefits.length === 0) && (
              <p className="text-sm text-muted-foreground">No benefits added yet</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_values">Company Values</Label>
          <div className="flex gap-2">
            <Input
              id="company_values"
              placeholder="Add a value (e.g., Innovation, Diversity)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleValueKeyDown}
            />
            <Button onClick={addValue}>Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.company_values?.map((value, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                {value}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => removeValue(value)}
                />
              </Badge>
            ))}
            
            {(!profile.company_values || profile.company_values.length === 0) && (
              <p className="text-sm text-muted-foreground">No values added yet</p>
            )}
          </div>
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
