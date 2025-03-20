/* eslint-disable @typescript-eslint/no-explicit-any */
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { BasicInfoStep } from '@/components/onboarding/student/BasicInfoStep';
import { ProfilePictureStep } from '@/components/onboarding/student/ProfilePictureStep';
import { GitHubStep } from '@/components/onboarding/student/GitHubStep';
import { LinkedInStep } from '@/components/onboarding/student/LinkedInStep';
import { ResumeStep } from '@/components/onboarding/student/ResumeStep';
import { SkillsStep } from '@/components/onboarding/student/SkillsStep';
import { CompletedStep } from '@/components/onboarding/student/CompletedStep';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const StudentOnboardingContent = () => {
  const { studentStep, studentProgress, setStudentStep } = useOnboarding();
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if student profile exists, create one if it doesn't
  useEffect(() => {
    const checkStudentProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // Ensure the user is properly authenticated before accessing the database
        await supabase.auth.refreshSession();
        
        // Check if profile exists
        const { data, error } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
          throw error;
        }

        // If profile doesn't exist, create a basic one
        if (!data) {
          // Make sure we explicitly set the user ID in the profile
          const newProfile = {
            id: session.user.id,
            xp_points: 0,
            skills: []
            // Removed created_at as it doesn't exist in the schema
          };

          const { error: insertError } = await supabase
            .from('student_profiles')
            .insert(newProfile);

          if (insertError) {
            console.error("Profile insertion error:", insertError);
            throw insertError;
          }
          
          // Always start at basic-info for new profiles
          setStudentStep('basic-info');
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Profile error",
          description: `Failed to load or create your profile: ${err.message}`,
        });
        console.error("Profile check error:", err.message);
      } finally {
        setIsChecking(false);
      }
    };

    checkStudentProfile();
  }, [navigate, toast, setStudentStep]);

  if (isChecking) {
    return (
      <OnboardingLayout 
        title="Preparing your onboarding" 
        description="Just a moment while we get things ready..."
        progress={0}
        showBackButton={false}
      >
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      </OnboardingLayout>
    );
  }
  
  const getStepContent = () => {
    switch (studentStep) {
      case 'basic-info':
        return (
          <OnboardingLayout 
            title="Let's set up your student profile" 
            description="Tell us about yourself to get started"
            progress={studentProgress}
            showBackButton={false}
          >
            <BasicInfoStep />
          </OnboardingLayout>
        );
      case 'profile-picture':
        return (
          <OnboardingLayout 
            title="Add a profile picture" 
            description="Upload a professional photo for your profile"
            progress={studentProgress}
          >
            <ProfilePictureStep />
          </OnboardingLayout>
        );
      case 'github':
        return (
          <OnboardingLayout 
            title="Connect with GitHub" 
            description="Showcase your coding projects to potential employers"
            progress={studentProgress}
          >
            <GitHubStep />
          </OnboardingLayout>
        );
      case 'linkedin':
        return (
          <OnboardingLayout 
            title="Connect with LinkedIn" 
            description="Add your professional network to enhance your profile"
            progress={studentProgress}
          >
            <LinkedInStep />
          </OnboardingLayout>
        );
      case 'resume':
        return (
          <OnboardingLayout 
            title="Upload your resume" 
            description="Add your resume to apply for jobs quickly"
            progress={studentProgress}
          >
            <ResumeStep />
          </OnboardingLayout>
        );
      case 'skills':
        return (
          <OnboardingLayout 
            title="Add your skills" 
            description="List your technical and professional skills to match with jobs"
            progress={studentProgress}
          >
            <SkillsStep />
          </OnboardingLayout>
        );
      case 'completed':
        return (
          <OnboardingLayout 
            title="Onboarding Complete" 
            description="You're all set to start your job search journey"
            progress={100}
            showBackButton={false}
          >
            <CompletedStep />
          </OnboardingLayout>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return getStepContent();
};
