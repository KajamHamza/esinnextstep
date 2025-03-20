
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define learning path types
export type LearningPath = {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  xpReward: number;
  enrolled: boolean;
};

export const LearningPathCard = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchLearningProgress = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Fetch available learning paths
        const { data: availablePaths, error: pathsError } = await supabase
          .from('learning_paths')
          .select('*');
          
        if (pathsError) throw pathsError;
          
        // Fetch user enrollments
        const { data: userEnrollments, error: enrollmentsError } = await supabase
          .from('learning_enrollments')
          .select('learning_path_id')
          .eq('student_id', session.user.id);
        
        if (enrollmentsError) throw enrollmentsError;
        
        // Fetch completed modules
        const { data: completedModules, error: progressError } = await supabase
          .from('learning_progress')
          .select('learning_path_id, module_id')
          .eq('student_id', session.user.id);
          
        if (progressError) throw progressError;
        
        // Group completed modules by learning path
        const completedByPath: Record<string, string[]> = {};
        completedModules?.forEach(item => {
          if (!completedByPath[item.learning_path_id]) {
            completedByPath[item.learning_path_id] = [];
          }
          completedByPath[item.learning_path_id].push(item.module_id);
        });
        
        // Map learning paths with user progress if enrolled
        const pathsWithProgress = availablePaths?.map(path => {
          const enrolled = userEnrollments?.some(e => e.learning_path_id === path.id) || false;
          const completedModulesCount = completedByPath[path.id]?.length || 0;
          
          return {
            id: path.id,
            title: path.title,
            description: path.description,
            totalModules: path.total_modules,
            completedModules: completedModulesCount,
            progress: path.total_modules > 0 
              ? Math.round((completedModulesCount / path.total_modules) * 100) 
              : 0,
            xpReward: path.xp_reward,
            enrolled: enrolled
          };
        }) || [];
        
        setLearningPaths(pathsWithProgress);
      } catch (error: any) {
        console.error("Error fetching learning paths:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load learning paths"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearningProgress();
  }, [toast]);
  
  const handleEnroll = async (pathId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to enroll in learning paths"
        });
        return;
      }

      // Enroll the user in the learning path
      const { error } = await supabase
        .from('learning_enrollments')
        .insert({
          student_id: session.user.id,
          learning_path_id: pathId,
          enrolled_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Update local state to reflect enrollment
      setLearningPaths(prev => prev.map(path => 
        path.id === pathId ? { ...path, enrolled: true } : path
      ));
      
      toast({
        title: "Enrolled successfully",
        description: "You have been enrolled in the learning path"
      });
    } catch (error: any) {
      console.error("Error enrolling in learning path:", error);
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message || "Failed to enroll in learning path"
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Award className="mr-2 h-5 w-5 text-yellow-500" />
          Learning Path
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Complete learning paths to earn badges and XP</p>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {learningPaths.map(path => (
              <div key={path.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">{path.title}</h4>
                  <span className="text-xs text-purple-600 font-medium">{path.progress}% Complete</span>
                </div>
                <Progress value={path.progress} className="h-2" />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {path.completedModules} of {path.totalModules} modules completed
                  </p>
                  <p className="text-xs text-purple-600">+{path.xpReward} XP on completion</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-1"
                  onClick={() => path.enrolled 
                    ? navigate(`/learning/${path.id}`) 
                    : handleEnroll(path.id)
                  }
                >
                  {path.enrolled ? (
                    <>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Continue Learning
                    </>
                  ) : "Enroll Now"}
                </Button>
              </div>
            ))}
            
            {learningPaths.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No learning paths available at the moment.
              </div>
            )}
          </div>
        )}
        
        <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/learning')}>
          View All Learning Paths
        </Button>
      </CardContent>
    </Card>
  );
};
