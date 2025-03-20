
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { StudentOnboardingContent } from '@/components/onboarding/student/StudentOnboardingContent';

const StudentOnboarding = () => {
  return (
    <OnboardingProvider>
      <StudentOnboardingContent />
    </OnboardingProvider>
  );
};

export default StudentOnboarding;
