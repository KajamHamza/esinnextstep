/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SkillsStep = () => {
  const { setStudentStep } = useOnboarding();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // Check if profile exists
        const { data, error } = await supabase
          .from('student_profiles')
          .select('skills')
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
        } else if (data && data.skills) {
          setSkills(data.skills);
        }
      } catch (error: any) {
        // Only show errors for actual issues
        if (error.code !== 'PGRST116') {
          console.error("Error fetching skills:", error.message);
        }
      }
    };

    fetchSkills();
  }, [navigate, toast]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    // Check if skill already exists
    if (skills.includes(newSkill.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate skill",
        description: "This skill is already in your list.",
      });
      return;
    }
    
    // Add new skill
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async () => {
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
          skills: skills
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
        title: "Skills saved",
        description: "Your skills have been saved. Onboarding complete!",
      });

      // Add 50 XP for completing onboarding
      const { error: xpError } = await supabase
        .from('student_profiles')
        .update({
          xp_points: 50
        })
        .eq('id', session.user.id);

      if (xpError) console.error("Error adding XP:", xpError);

      // Create achievement for completing onboarding
      const { error: achievementError } = await supabase
        .from('achievements')
        .insert({
          user_id: session.user.id,
          name: "Onboarding Complete",
          type: "onboarding",
          description: "Completed your profile setup",
          xp_awarded: 50,
          badge_image_url: null
        });

      if (achievementError) console.error("Error creating achievement:", achievementError);

      setStudentStep('completed');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving skills",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Add Your Skills</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add technical and professional skills to help match with relevant job opportunities.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g., JavaScript, Project Management)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={addSkill} className="bg-purple-600 hover:bg-purple-700">Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                {skill}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
            
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          {loading ? 'Saving...' : 'Complete Profile'}
        </Button>
      </div>
    </div>
  );
};
