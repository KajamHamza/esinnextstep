
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

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
          Your company profile is now ready. You can now post jobs and start recruiting talent!
        </p>
      </div>
      
      <div className="flex flex-col items-center pt-4">
        <Button onClick={() => navigate('/dashboard')} className="w-full max-w-xs">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
