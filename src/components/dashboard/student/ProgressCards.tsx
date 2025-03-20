
import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, FileText, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useResume } from "@/hooks/use-resume";
import { ResumeData } from "@/types/resume";

// Define the calculateResumeCompletion function before it's used
const calculateResumeCompletion = (resume: ResumeData): number => {
  let completedSections = 0;
  let totalSections = 5; // basic_info, education, experience, skills, projects
  
  // Check each section for completion
  if (resume.basic_info.name && 
      resume.basic_info.email && 
      resume.basic_info.phone) {
    completedSections++;
  }
  
  if (resume.education && resume.education.length > 0) {
    completedSections++;
  }
  
  if (resume.experience && resume.experience.length > 0) {
    completedSections++;
  }
  
  if (resume.skills.technical.length > 0 || resume.skills.soft.length > 0) {
    completedSections++;
  }
  
  if (resume.projects && resume.projects.length > 0) {
    completedSections++;
  }
  
  return Math.round((completedSections / totalSections) * 100);
};

export const ProgressCards = () => {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(25);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [applicationsSent, setApplicationsSent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { resumes, loading: resumesLoading } = useResume();

  // Calculate resume completion percentage based on filled sections
  const resumeProgress = useMemo(() => {
    if (resumesLoading || resumes.length === 0) {
      return 0;
    }

    // Find primary resume or use first one
    const primaryResume = resumes.find(r => r.is_primary) || resumes[0];
    
    return calculateResumeCompletion(primaryResume);
  }, [resumes, resumesLoading]);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch student profile data for XP and level
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('xp_points, level')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setLevel(profileData.level || 1);
          setXp(profileData.xp_points || 25);
          // Calculate XP to next level based on current level
          setXpToNextLevel((profileData.level || 1) * 100);
        }

        // Fetch job applications count
        const { count } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', session.user.id);
          
        if (count !== null) {
          setApplicationsSent(count);
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Level Progress Card */}
      <Card className="border-t-4 border-t-purple-600 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-baseline">
            Level {level}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({xp} XP)</span>
          </div>
          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full" 
              style={{ width: `${Math.min(100, (xp / xpToNextLevel) * 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {xp}/{xpToNextLevel} XP to Level {level + 1}
          </div>
        </CardContent>
      </Card>
      
      {/* Resume Completion Card */}
      <Card className="border-t-4 border-t-blue-600 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <FileText className="mr-2 h-4 w-4 text-blue-600" />
            Resume Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumeProgress}%</div>
          <Progress 
            value={resumeProgress} 
            className="h-2 mt-2 bg-gray-200"
          />
          <div className="mt-2 text-xs text-gray-500">
            {resumeProgress < 100 ? (
              resumeProgress === 0 ? 'Create your first resume to earn 25 XP' : 
              resumeProgress < 40 ? 'Add your education to earn 25 XP' :
              resumeProgress < 60 ? 'Add your work experience to earn 25 XP' :
              resumeProgress < 80 ? 'Add your skills to earn 25 XP' :
              'Add some projects to earn 25 XP'
            ) : 'Resume complete! Great job!'}
          </div>
        </CardContent>
      </Card>
      
      {/* Applications Sent Card */}
      <Card className="border-t-4 border-t-green-600 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Send className="mr-2 h-4 w-4 text-green-600" />
            Applications Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applicationsSent}</div>
          <div className="mt-4 text-xs text-gray-500">
            {applicationsSent === 0 
              ? 'Start applying to jobs to earn XP' 
              : `You've sent ${applicationsSent} application${applicationsSent === 1 ? '' : 's'}`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

