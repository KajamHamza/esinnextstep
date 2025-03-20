
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Award, 
  Search, 
  Clock, 
  CheckCircle,
  Filter
} from "lucide-react";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { LearningPath } from "@/components/dashboard/student/LearningPathCard";

const LearningPaths = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'not-enrolled' | 'completed'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive", 
            title: "Authentication required",
            description: "Please log in to view learning paths"
          });
          navigate('/auth');
          return;
        }

        // Fetch all learning paths
        const { data: paths, error: pathsError } = await supabase
          .from('learning_paths')
          .select('*')
          .order('title', { ascending: true });
          
        if (pathsError) throw pathsError;
        
        // Fetch user enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('learning_enrollments')
          .select('learning_path_id')
          .eq('student_id', session.user.id);
          
        if (enrollmentsError) throw enrollmentsError;
        
        // Fetch user progress
        const { data: progress, error: progressError } = await supabase
          .from('learning_progress')
          .select('learning_path_id, module_id')
          .eq('student_id', session.user.id);
          
        if (progressError) throw progressError;
        
        // Group progress by learning path
        const progressByPath: Record<string, string[]> = {};
        progress?.forEach(item => {
          if (!progressByPath[item.learning_path_id]) {
            progressByPath[item.learning_path_id] = [];
          }
          progressByPath[item.learning_path_id].push(item.module_id);
        });
        
        // Build learning path objects with enrollment status and progress
        const enrolledPathIds = enrollments?.map(e => e.learning_path_id) || [];
        
        const processedPaths = paths?.map(path => {
          const isEnrolled = enrolledPathIds.includes(path.id);
          const completedModules = progressByPath[path.id]?.length || 0;
          const progress = path.total_modules > 0 
            ? Math.round((completedModules / path.total_modules) * 100) 
            : 0;
            
          return {
            id: path.id,
            title: path.title,
            description: path.description,
            totalModules: path.total_modules,
            completedModules,
            progress,
            xpReward: path.xp_reward,
            enrolled: isEnrolled
          };
        }) || [];
        
        setLearningPaths(processedPaths);
        setFilteredPaths(processedPaths);
      } catch (error: any) {
        console.error("Error fetching learning paths:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load learning paths"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearningPaths();
  }, [navigate, toast]);
  
  // Apply filters and search whenever the source data or filters change
  useEffect(() => {
    let result = [...learningPaths];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(path => 
        path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    switch (filter) {
      case 'enrolled':
        result = result.filter(path => path.enrolled);
        break;
      case 'not-enrolled':
        result = result.filter(path => !path.enrolled);
        break;
      case 'completed':
        result = result.filter(path => path.progress === 100);
        break;
      // 'all' case doesn't need filtering
    }
    
    setFilteredPaths(result);
  }, [learningPaths, searchTerm, filter]);
  
  const handleEnroll = async (pathId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Enroll the user in the learning path
      const { error } = await supabase
        .from('learning_enrollments')
        .insert({
          student_id: session.user.id,
          learning_path_id: pathId,
          enrolled_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Update local state
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
  
  const handleLogout = async () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
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
      <Sidebar userRole="student" onLogout={handleLogout} />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <MobileHeader onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Learning Paths</h1>
                <p className="text-muted-foreground mt-1">Expand your skills and earn XP by completing learning paths</p>
              </div>
            </div>
            
            {/* Search and filters */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search learning paths..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={filter === 'all' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      variant={filter === 'enrolled' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('enrolled')}
                    >
                      Enrolled
                    </Button>
                    <Button 
                      variant={filter === 'not-enrolled' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('not-enrolled')}
                    >
                      Not Enrolled
                    </Button>
                    <Button 
                      variant={filter === 'completed' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('completed')}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Path listings */}
            {filteredPaths.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Learning Paths Found</h2>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "No learning paths match your search criteria. Try a different search term."
                    : filter !== 'all' 
                      ? "No learning paths match the selected filter. Try a different filter."
                      : "No learning paths are available at the moment. Check back later."}
                </p>
                {(searchTerm || filter !== 'all') && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPaths.map((path) => (
                  <Card key={path.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{path.title}</CardTitle>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          +{path.xpReward} XP
                        </Badge>
                      </div>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm">{path.completedModules}/{path.totalModules} modules</span>
                          </div>
                          <Progress value={path.progress} className="h-2" />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {path.totalModules} Modules
                          </Badge>
                          
                          {path.enrolled && (
                            <Badge 
                              variant="outline" 
                              className={`flex items-center ${
                                path.progress === 100 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}
                            >
                              {path.progress === 100 ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  In Progress
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50 dark:bg-slate-800">
                      {path.enrolled ? (
                        <Button 
                          className="w-full"
                          onClick={() => navigate(`/learning/${path.id}`)}
                        >
                          {path.progress === 100 ? (
                            <>
                              <Award className="h-4 w-4 mr-2" />
                              Review Content
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Continue Learning
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleEnroll(path.id)}
                        >
                          Enroll Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPaths;
