
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Award, 
  Briefcase, 
  BookOpen, 
  Users, 
  Star, 
  GraduationCap,
  Clock
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { useNavigate } from "react-router-dom";

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_image_url: string | null;
  type: string;
  earned_at: string;
  xp_awarded: number;
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // Fetch user profile to get XP and level
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('xp_points, level')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setXp(profile.xp_points);
          setLevel(profile.level);
        }
        
        // Fetch user achievements
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', session.user.id)
          .order('earned_at', { ascending: false });
          
        if (error) throw error;
        
        setAchievements(data || []);
      } catch (error: any) {
        console.error("Error fetching achievements:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load achievements"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [navigate, toast]);
  
  // Filter achievements by type
  const filteredAchievements = activeFilter === "all" 
    ? achievements 
    : achievements.filter(a => a.type === activeFilter);
  
  // Calculate progress to next level
  const calculateLevelProgress = () => {
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const currentLevelXp = xp - xpForCurrentLevel;
    const neededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.floor((currentLevelXp / neededForNextLevel) * 100);
  };
  
  // Total XP earned from achievements
  const totalAchievementXp = achievements.reduce((total, a) => total + a.xp_awarded, 0);
  
  // Get icon based on achievement type
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-6 w-6 text-blue-500" />;
      case "learning":
        return <BookOpen className="h-6 w-6 text-purple-500" />;
      case "mentorship":
        return <Users className="h-6 w-6 text-green-500" />;
      case "membership":
        return <Award className="h-6 w-6 text-amber-500" />;
      case "general":
        return <Star className="h-6 w-6 text-yellow-500" />;
      case "skill":
        return <GraduationCap className="h-6 w-6 text-indigo-500" />;
      default:
        return <Trophy className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <Sidebar userRole="student" onLogout={handleLogout} />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <MobileHeader onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Achievements</h1>
              <p className="text-muted-foreground mt-1">Track your progress and earn rewards</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Level {level}</CardTitle>
                      <CardDescription>
                        {calculateLevelProgress()}% to Level {level + 1}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={calculateLevelProgress()} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">{xp} XP total</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Badges Earned</CardTitle>
                      <CardDescription>
                        Collect more achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-2">
                      <Trophy className="h-8 w-8 text-amber-500" />
                      <div>
                        <p className="text-2xl font-bold">{achievements.length}</p>
                        <p className="text-sm text-muted-foreground">Total achievements</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">XP from Achievements</CardTitle>
                      <CardDescription>
                        XP earned from completed achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-2">
                      <Award className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">{totalAchievementXp}</p>
                        <p className="text-sm text-muted-foreground">XP earned</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Tabs defaultValue="all" className="mb-8">
                  <TabsList className="mb-6">
                    <TabsTrigger value="all" onClick={() => setActiveFilter("all")}>All</TabsTrigger>
                    <TabsTrigger value="general" onClick={() => setActiveFilter("general")}>General</TabsTrigger>
                    <TabsTrigger value="job" onClick={() => setActiveFilter("job")}>Jobs</TabsTrigger>
                    <TabsTrigger value="learning" onClick={() => setActiveFilter("learning")}>Learning</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredAchievements.length > 0 ? (
                        filteredAchievements.map((achievement) => (
                          <Card key={achievement.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                            <CardContent className="pt-6">
                              <div className="flex items-start mb-4">
                                <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                                  {getAchievementIcon(achievement.type)}
                                </div>
                                <div className="ml-4">
                                  <h3 className="font-medium">{achievement.name}</h3>
                                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{formatDate(achievement.earned_at)}</span>
                                </div>
                                <div className="text-purple-600 font-medium">+{achievement.xp_awarded} XP</div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                          <h2 className="text-2xl font-bold mb-2">No Achievements Yet</h2>
                          <p className="text-gray-500 mb-4 max-w-md mx-auto">
                            {activeFilter === "all" 
                              ? "Start applying for jobs, taking courses, and using mentorship to earn achievements."
                              : `Complete ${activeFilter} activities to earn achievements in this category.`}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="general" className="mt-0">
                    {/* Content automatically filtered by the state */}
                  </TabsContent>
                  
                  <TabsContent value="job" className="mt-0">
                    {/* Content automatically filtered by the state */}
                  </TabsContent>
                  
                  <TabsContent value="learning" className="mt-0">
                    {/* Content automatically filtered by the state */}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Achievements;
