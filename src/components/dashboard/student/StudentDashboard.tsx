
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AccountBanner } from "./AccountBanner";
import { ProgressCards } from "./ProgressCards";
import { JobQuest } from "./JobQuest";
import { AchievementBadges } from "./AchievementBadges";
import { LearningPathCard } from "./LearningPathCard";
import { RecommendedJobs } from "./RecommendedJobs";
import { MentorshipCard } from "./MentorshipCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  xp_points: number;
  level: number;
  profile_image_url: string | null;
}

interface StudentDashboardProps {
  account_type: 'free' | 'premium';
}

export const StudentDashboard = ({ account_type }: StudentDashboardProps) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('student_profiles')
          .select('id, first_name, last_name, xp_points, level, profile_image_url')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome back, {profile?.first_name || 'Student'}
          </h1>
          <p className="text-muted-foreground">
            Track your progress, explore job opportunities, and level up your career
          </p>
        </div>
      </div>
      
      {/* Account Banner */}
      <AccountBanner accountType={account_type} />
      
      {/* Progress Cards */}
      <ProgressCards />
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            <JobQuest />
            <LearningPathCard />
          </div>
          <RecommendedJobs />
          <MentorshipCard />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-6 animate-fade-in">
          <RecommendedJobs />
          <JobQuest />
        </TabsContent>
        
        <TabsContent value="learning" className="space-y-6 animate-fade-in">
          <LearningPathCard />
          <MentorshipCard />
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6 animate-fade-in">
          <AchievementBadges />
        </TabsContent>
      </Tabs>
    </div>
  );
};
