
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { achievementService, type Achievement } from "@/services/achievementService";
import { Award, Calendar, Share2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';

const AchievementDetails = () => {
  const { achievementId } = useParams();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAchievementDetails = async () => {
      if (!achievementId) return;
      
      try {
        const achievementData = await achievementService.getAchievementById(achievementId);
        setAchievement(achievementData);
      } catch (error) {
        console.error("Error fetching achievement details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load achievement details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievementDetails();
  }, [achievementId, toast]);

  const handleShare = () => {
    // In a real implementation, this would open a share dialog
    toast({
      title: "Share feature",
      description: "Sharing functionality will be implemented in a future update."
    });
  };

  const handleLogout = async () => {
    // Handle logout
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="pt-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">Achievement Not Found</h2>
                  <p className="text-muted-foreground mb-4">The achievement you're looking for doesn't exist or you don't have access to it.</p>
                  <Button onClick={() => navigate('/achievements')}>View All Achievements</Button>
                </CardContent>
              </Card>
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
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
            
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-32 flex items-end justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-full p-4 mb-[-2rem] shadow-lg">
                  {achievement.badge_image_url ? (
                    <img 
                      src={achievement.badge_image_url} 
                      alt={achievement.name} 
                      className="h-24 w-24"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-purple-600" />
                    </div>
                  )}
                </div>
              </div>
              
              <CardHeader className="text-center mt-8">
                <Badge variant="secondary" className="mb-2 mx-auto">
                  {achievement.type}
                </Badge>
                <CardTitle className="text-2xl font-bold">{achievement.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1 mt-1">
                  <Award className="h-4 w-4" /> {achievement.xp_awarded} XP Awarded
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2 flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Earned on {format(new Date(achievement.earned_at), 'MMMM dd, yyyy')}
                  </p>
                  
                  {achievement.description && (
                    <p className="my-4 max-w-lg mx-auto">{achievement.description}</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Achievement
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Achievement Impact</h3>
                  <div className="text-center">
                    <p>This achievement has increased your profile visibility by <span className="font-semibold text-purple-600">10%</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AchievementDetails;
