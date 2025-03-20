
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { ResumeBuilderContent } from '@/components/resume/ResumeBuilderContent';
import { Profile } from '@/types/profile';

// Define a type for AI usage tracking
type AIUsageData = {
  count: number;
  date: string; // ISO date string
};

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [aiUsageDate, setAiUsageDate] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Define the AI usage limit based on account type
  const aiUsageLimit = profile?.account_type === 'premium' ? 20 : 5;

  // Load session and profile data only once on component mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        // Set authentication state early
        if (isMounted) {
          setIsAuthenticated(true);
          setStudentEmail(session.user.email || '');
        }

        // Fetch profile data
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            toast({
              variant: "destructive",
              title: "Profile not found",
              description: "Please log in again",
            });
            navigate('/auth');
            return;
          }
          throw profileError;
        }
        
        if (data.role !== 'student') {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "Resume builder is only available for students",
          });
          navigate('/dashboard');
          return;
        }
        
        if (isMounted) {
          setProfile(data as Profile);
        }
        
        // Fetch AI usage data from local storage
        const storedUsage = localStorage.getItem(`ai_usage_${session.user.id}`);
        if (storedUsage && isMounted) {
          const usageData: AIUsageData = JSON.parse(storedUsage);
          const today = new Date().toISOString().split('T')[0];
          
          // Reset counter if it's a new day
          if (usageData.date !== today) {
            setAiUsageCount(0);
            setAiUsageDate(today);
            localStorage.setItem(`ai_usage_${session.user.id}`, JSON.stringify({
              count: 0,
              date: today
            }));
          } else {
            setAiUsageCount(usageData.count);
            setAiUsageDate(usageData.date);
          }
        } else if (isMounted) {
          // Initialize usage tracking
          const today = new Date().toISOString().split('T')[0];
          setAiUsageCount(0);
          setAiUsageDate(today);
          localStorage.setItem(`ai_usage_${session.user.id}`, JSON.stringify({
            count: 0,
            date: today
          }));
        }
        
      } catch (error: any) {
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Please log in again",
          });
          navigate('/auth');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      });
    }
  };
  
  // Memoize the updateAIUsage function to prevent unnecessary re-renders
  const updateAIUsage = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;
      
      const today = new Date().toISOString().split('T')[0];
      const newCount = aiUsageCount + 1;
      
      setAiUsageCount(newCount);
      setAiUsageDate(today);
      
      localStorage.setItem(`ai_usage_${session.user.id}`, JSON.stringify({
        count: newCount,
        date: today
      }));
      
      return newCount;
    } catch (error) {
      console.error("Error updating AI usage:", error);
      return aiUsageCount + 1;
    }
  }, [aiUsageCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Authentication Required</h1>
          <p className="mb-4 text-muted-foreground">Please log in to access the resume builder</p>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => navigate('/auth')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar 
        userRole="student"
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <MobileHeader onLogout={handleLogout} />
        
        {/* Resume Builder Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {profile && (
              <ResumeBuilderContent
                accountType={profile.account_type || 'free'}
                resumeId={resumeId}
                userEmail={studentEmail}
                aiUsageCount={aiUsageCount}
                updateAIUsage={updateAIUsage}
                aiUsageLimit={aiUsageLimit}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumeBuilder;
