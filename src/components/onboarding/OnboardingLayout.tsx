
import { ReactNode } from 'react';
import { GraduationCap, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  progress: number;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function OnboardingLayout({
  children,
  title,
  description,
  progress,
  onBack,
  showBackButton = true,
}: OnboardingLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-950 px-4 py-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <GraduationCap className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold">EsinNextStep</h1>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-white dark:bg-slate-950 px-4 py-1">
        <div className="container mx-auto max-w-5xl">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4" 
              onClick={handleBack}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-950 rounded-lg border p-6 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
