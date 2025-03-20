
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LearningModule, LearningPath } from '@/types/learningPath';
import { CheckCircle2, Clock, BookOpen } from 'lucide-react';

const LearningPathDetails = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        // Fetch profile data
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Please log in again",
        });
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!pathId) return;
      
      try {
        setLoading(true);
        
        // Fetch the learning path modules
        const { data: modulesData, error } = await supabase
          .from('learning_modules') // Changed from learning_path_modules to learning_modules
          .select('*')
          .eq('learning_path_id', pathId)
          .order('order_number');
          
        if (error) throw error;
        
        if (modulesData) {
          // Map the raw database data to the LearningModule type
          const mappedModules: LearningModule[] = modulesData.map(module => ({
            id: module.id,
            title: module.title,
            description: module.description || '',
            content: module.content || '',
            duration: module.duration || 0,
            learning_path_id: module.learning_path_id,
            created_at: module.created_at,
            order_number: module.order_number,
            completed: false, // We'll update this in the next step
            // Add these properties to fix type errors
            type: 'module', // default type
            order: module.order_number // use order_number as order
          }));
          
          // Get completed modules for the current user
          if (profile) {
            const { data: progressData } = await supabase
              .from('learning_progress')
              .select('module_id')
              .eq('student_id', profile.id)
              .eq('learning_path_id', pathId);
              
            if (progressData && progressData.length > 0) {
              const completedModuleIds = progressData.map(item => item.module_id);
              // Update completed status for modules
              mappedModules.forEach(module => {
                if (completedModuleIds.includes(module.id)) {
                  module.completed = true;
                }
              });
            }
          }
          
          setModules(mappedModules);
          
          // If currentModule isn't set, select the first module
          if (!currentModule && mappedModules.length > 0) {
            setCurrentModule(mappedModules[0]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching learning path modules:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load learning modules"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchModules();
  }, [pathId, profile, toast]);

  // Re-fetch current module when it's updated (e.g., marked as complete)
  useEffect(() => {
    if (currentModule && modules.length > 0) {
      const updatedModule = modules.find(m => m.id === currentModule.id);
      if (updatedModule && updatedModule.completed !== currentModule.completed) {
        setCurrentModule(updatedModule);
      }
    }
  }, [modules, currentModule]);

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

  const markModuleComplete = async (moduleId: string) => {
    try {
      if (!profile) return;
      
      // Check if there's already a progress record
      const { data: existingProgress } = await supabase
        .from('learning_progress')
        .select('id')
        .eq('student_id', profile.id)
        .eq('module_id', moduleId)
        .eq('learning_path_id', pathId)
        .single();
        
      if (!existingProgress) {
        // Insert a new progress record
        const { error } = await supabase
          .from('learning_progress')
          .insert({
            student_id: profile.id,
            module_id: moduleId,
            learning_path_id: pathId
          });
            
        if (error) throw error;
      }
      
      // Update local state
      setModules(modules.map(module => 
        module.id === moduleId ? { ...module, completed: true } : module
      ));
      
      if (currentModule?.id === moduleId) {
        setCurrentModule({ ...currentModule, completed: true });
      }
      
      toast({
        title: "Module Completed",
        description: "You have marked this module as complete",
      });
    } catch (error: any) {
      console.error('Error marking module as complete:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark module as complete",
      });
    }
  };

  const renderModuleContent = () => {
    if (!currentModule) {
      return <div className="text-center py-8">Select a module to view its content.</div>;
    }

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{currentModule.title}</CardTitle>
          <CardDescription>{currentModule.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: currentModule.content }} />
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{currentModule.duration} minutes</span>
            </div>
            <Button 
              variant="outline"
              disabled={currentModule.completed}
              onClick={() => markModuleComplete(currentModule.id)}
            >
              {currentModule.completed ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Completed
                </>
              ) : (
                "Mark as Complete"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole={profile?.role || 'student'} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <Sidebar userRole={profile?.role || 'student'} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <MobileHeader onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Learning Path Details</h1>
              <p className="text-muted-foreground">
                Explore the modules in this learning path and track your progress.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-purple-500" />
                      Modules
                    </CardTitle>
                    <CardDescription>
                      {modules.length} modules in this learning path
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                      {modules.map(module => (
                        <div
                          key={module.id}
                          className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 ${currentModule?.id === module.id ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
                          onClick={() => setCurrentModule(module)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {module.completed && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                              <span>{module.title}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                {renderModuleContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPathDetails;
