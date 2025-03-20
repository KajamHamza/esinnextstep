
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

// Import refactored steps
import { CompanyInfoStep } from '@/components/onboarding/employer/CompanyInfoStep';
import { CompanyLogoStep } from '@/components/onboarding/employer/CompanyLogoStep';
import { CompanyDetailsStep } from '@/components/onboarding/employer/CompanyDetailsStep';
import { ContactInfoStep } from '@/components/onboarding/employer/ContactInfoStep';
import { CompletedStep } from '@/components/onboarding/employer/CompletedStep';

const EmployerOnboardingContent = () => {
  const { employerStep, employerProgress } = useOnboarding();
  
  const getStepContent = () => {
    switch (employerStep) {
      case 'company-info':
        return (
          <OnboardingLayout 
            title="Let's set up your company profile" 
            description="Tell us about your company to get started"
            progress={employerProgress}
            showBackButton={false}
          >
            <CompanyInfoStep />
          </OnboardingLayout>
        );
      case 'company-logo':
        return (
          <OnboardingLayout 
            title="Add your company logo" 
            description="Upload a logo to make your profile more professional"
            progress={employerProgress}
          >
            <CompanyLogoStep />
          </OnboardingLayout>
        );
      case 'company-details':
        return (
          <OnboardingLayout 
            title="Company details" 
            description="Add more details about your company culture and benefits"
            progress={employerProgress}
          >
            <CompanyDetailsStep />
          </OnboardingLayout>
        );
      case 'contact-info':
        return (
          <OnboardingLayout 
            title="Contact information" 
            description="Add contact details for job applicants"
            progress={employerProgress}
          >
            <ContactInfoStep />
          </OnboardingLayout>
        );
      case 'completed':
        return (
          <OnboardingLayout 
            title="Onboarding Complete" 
            description="You're all set to start recruiting top talent"
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

const EmployerOnboarding = () => {
  return (
    <OnboardingProvider>
      <EmployerOnboardingContent />
    </OnboardingProvider>
  );
};

export default EmployerOnboarding;
