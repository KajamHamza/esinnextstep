import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Award, Zap } from 'lucide-react';

export const CompletedStep = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-2">Setup Complete!</h3>
        <p className="text-muted-foreground">
          Your profile is now ready. You've earned 50 XP and your first achievement!
        </p>
      </div>
      
      <div className="flex flex-col space-y-4 items-center pt-4">
        <div className="flex items-center justify-center gap-4 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg w-full max-w-xs">
          <div className="flex flex-col items-center">
            <Zap className="h-6 w-6 text-yellow-500 mb-1" />
            <span className="text-sm font-medium">50 XP</span>
          </div>
          <div className="h-10 border-l border-purple-200 dark:border-purple-700"></div>
          <div className="flex flex-col items-center">
            <Award className="h-6 w-6 text-purple-600 mb-1" />
            <span className="text-sm font-medium">First Achievement</span>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="w-full max-w-xs bg-purple-600 hover:bg-purple-700"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
