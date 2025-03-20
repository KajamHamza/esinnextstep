
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, BookOpen, Star, BriefcaseBusiness, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_image_url: string | null;
  type: string;
  earned_at: string;
  xp_awarded: number;
}

interface BadgeProps {
  name: string;
  achieved: boolean;
  description: string;
  xp: number;
  icon: React.ReactNode;
}

const Badge = ({ name, achieved, description, xp, icon }: BadgeProps) => (
  <div className={`p-4 rounded-lg border text-center relative ${
    achieved 
    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
    : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
  }`}>
    <div className="absolute top-2 right-2">
      {achieved && <Check className="h-4 w-4 text-green-500" />}
    </div>
    <div className="flex justify-center mb-2">
      <div className={`p-2 rounded-full ${
        achieved 
        ? 'bg-green-100 dark:bg-green-800' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
      }`}>
        {icon}
      </div>
    </div>
    <h3 className="font-medium text-sm">{name}</h3>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
    <p className={`text-xs mt-2 ${achieved ? 'text-green-600' : 'text-muted-foreground'}`}>
      {achieved ? `+${xp} XP Earned` : `+${xp} XP`}
    </p>
  </div>
);

export const AchievementBadges = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

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
  }, [toast]);
  
  // Check if user has a specific achievement
  const hasAchievement = (name: string) => {
    return achievements.some(a => a.name === name);
  };
  
  // Calculate progress to next level
  const calculateLevelProgress = () => {
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const currentLevelXp = xp - xpForCurrentLevel;
    const neededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.floor((currentLevelXp / neededForNextLevel) * 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Trophy className="mr-2 h-5 w-5 text-amber-500" />
          Achievements
        </CardTitle>
        <CardDescription>
          Complete activities to earn badges and XP
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">Level {level}</h3>
                  <p className="text-xs text-muted-foreground">{xp} XP total</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Next level: {level + 1}</p>
                  <p className="text-xs text-amber-600">{calculateLevelProgress()}% Complete</p>
                </div>
              </div>
              <Progress value={calculateLevelProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Badge
                name="Newcomer"
                achieved={hasAchievement("Newcomer")}
                description="Join the platform"
                xp={10}
                icon={<Star className="h-5 w-5 text-amber-500" />}
              />
              
              <Badge
                name="First Application"
                achieved={hasAchievement("First Application")}
                description="Apply to your first job"
                xp={25}
                icon={<BriefcaseBusiness className="h-5 w-5 text-blue-500" />}
              />
              
              <Badge
                name="Resume Builder"
                achieved={hasAchievement("Resume Builder")}
                description="Create your first resume"
                xp={20}
                icon={<BookOpen className="h-5 w-5 text-purple-500" />}
              />
              
              <Badge
                name="Premium Member"
                achieved={hasAchievement("Premium Member")}
                description="Upgrade to premium"
                xp={50}
                icon={<Award className="h-5 w-5 text-emerald-500" />}
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/achievements')}
            >
              View All Achievements
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
