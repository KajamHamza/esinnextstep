
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Get initial values from URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const roleParam = queryParams.get('role');
    const signupParam = queryParams.get('signup');
    
    if (roleParam && (roleParam === 'student' || roleParam === 'employer')) {
      setRole(roleParam);
    }
    
    if (signupParam === 'true') {
      setAuthMode('signup');
    }
  }, [location]);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Get user profile to check onboarding status
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role, onboarding_completed')
          .eq('id', data.session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
          
        if (profileData) {
          // If onboarding is not completed, redirect to appropriate onboarding flow
          if (!profileData.onboarding_completed) {
            if (profileData.role === 'student') {
              navigate('/onboarding/student');
            } else if (profileData.role === 'employer') {
              navigate('/onboarding/employer');
            }
          } else {
            // If onboarding is completed, go to dashboard
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
      
      // Get user profile to check onboarding status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        navigate('/dashboard');
        return;
      }
        
      if (profileData) {
        // If onboarding is not completed, redirect to appropriate onboarding flow
        if (!profileData.onboarding_completed) {
          if (profileData.role === 'student') {
            navigate('/onboarding/student');
          } else if (profileData.role === 'employer') {
            navigate('/onboarding/employer');
          }
        } else {
          // If onboarding is completed, go to dashboard
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Update user's role in profiles table
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', data.user.id);
          
        if (updateError) throw updateError;
        
        // Create role-specific profile
        if (role === 'student') {
          const { error: profileError } = await supabase
            .from('student_profiles')
            .insert([{ id: data.user.id }]);
            
          if (profileError) throw profileError;
        } else if (role === 'employer') {
          const { error: profileError } = await supabase
            .from('employer_profiles')
            .insert([{ id: data.user.id, company_name: 'Your Company' }]);
            
          if (profileError) throw profileError;
        }
        
        toast({
          title: "Account created",
          description: "Welcome to EsinNextStep! Please check your email to verify your account.",
        });
        
        // Redirect to appropriate onboarding flow
        if (role === 'student') {
          navigate('/onboarding/student');
        } else if (role === 'employer') {
          navigate('/onboarding/employer');
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Unable to create your account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <GraduationCap className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold">EsinNextStep</h1>
          </div>
        </div>
      </header>

      {/* Auth Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {authMode === 'login' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription>
              {authMode === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Enter your information to create an account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {authMode === 'signup' && (
              <div className="mb-6">
                <Tabs value={role} onValueChange={setRole}>
                  <TabsList className="grid grid-cols-2 mb-2">
                    <TabsTrigger value="student" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Job Seeker</span>
                    </TabsTrigger>
                    <TabsTrigger value="employer" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Employer</span>
                    </TabsTrigger>
                  </TabsList>
                  <p className="text-sm text-gray-500 mt-1">
                    {role === 'student' 
                      ? 'For students, recent grads, and career switchers' 
                      : 'For companies looking to hire entry-level talent'}
                  </p>
                </Tabs>
              </div>
            )}
            
            <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? 'Processing...' 
                  : authMode === 'login' ? 'Login' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-gray-500 text-center">
              {authMode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode('signup')}>
                    Sign up
                  </Button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode('login')}>
                    Login
                  </Button>
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
