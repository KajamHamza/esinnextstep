/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, ReactNode } from 'react';

type OnboardingStep = 'basic-info' | 'profile-picture' | 'github' | 'linkedin' | 'resume' | 'skills' | 'completed';
type EmployerOnboardingStep = 'company-info' | 'company-logo' | 'company-details' | 'contact-info' | 'completed';

interface OnboardingContextType {
  studentStep: OnboardingStep;
  employerStep: EmployerOnboardingStep;
  setStudentStep: (step: OnboardingStep) => void;
  setEmployerStep: (step: EmployerOnboardingStep) => void;
  studentProgress: number;
  employerProgress: number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [studentStep, setStudentStep] = useState<OnboardingStep>('basic-info');
  const [employerStep, setEmployerStep] = useState<EmployerOnboardingStep>('company-info');

  // Calculate progress percentages
  const studentSteps = ['basic-info', 'profile-picture', 'github', 'linkedin', 'resume', 'skills', 'completed'];
  const employerSteps = ['company-info', 'company-logo', 'company-details', 'contact-info', 'completed'];
  
  const studentProgress = Math.round(((studentSteps.indexOf(studentStep) + 1) / studentSteps.length) * 100);
  const employerProgress = Math.round(((employerSteps.indexOf(employerStep) + 1) / employerSteps.length) * 100);

  return (
    <OnboardingContext.Provider 
      value={{ 
        studentStep, 
        employerStep, 
        setStudentStep, 
        setEmployerStep,
        studentProgress,
        employerProgress
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
