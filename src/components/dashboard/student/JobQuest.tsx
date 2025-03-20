import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Task = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  targetUrl: string;
  buttonText: string;
  category: 'profile' | 'resume' | 'application' | 'skill';
};

export const JobQuest = () => {
  const [priorityTask, setPriorityTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const determineNextTask = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('skills, github_username, linkedin_url, profile_image_url')
          .eq('id', session.user.id)
          .single();
          
        if (!profileData) return;
        
        const { data: resumesData } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', session.user.id);
          
        const resumeCount = resumesData?.length || 0;
        
        const { data: applicationsData } = await supabase
          .from('job_applications')
          .select('id')
          .eq('student_id', session.user.id);
          
        const applicationsCount = applicationsData?.length || 0;
        
        const tasks: Task[] = [
          {
            id: 'profile-pic',
            title: 'Add a profile picture',
            description: 'This will help recruiters remember you and make your profile more professional.',
            xpReward: 25,
            progress: profileData.profile_image_url ? 100 : 0,
            targetUrl: '/settings',
            buttonText: 'Upload Picture',
            category: 'profile'
          },
          {
            id: 'add-skills',
            title: 'Add 3 skills to your profile',
            description: 'This will help match you with jobs that align with your skills.',
            xpReward: 25,
            progress: profileData.skills && profileData.skills.length >= 3 ? 100 : 
                    profileData.skills ? Math.min(100, (profileData.skills.length / 3) * 100) : 0,
            targetUrl: '/profile',
            buttonText: 'Add Skills',
            category: 'skill'
          },
          {
            id: 'github-profile',
            title: 'Connect your GitHub account',
            description: 'Showcase your coding projects to potential employers.',
            xpReward: 50,
            progress: profileData.github_username ? 100 : 0,
            targetUrl: '/profile',
            buttonText: 'Connect GitHub',
            category: 'profile'
          },
          {
            id: 'linkedin-profile',
            title: 'Add your LinkedIn profile',
            description: 'Help recruiters find you on professional networks.',
            xpReward: 25,
            progress: profileData.linkedin_url ? 100 : 0,
            targetUrl: '/profile',
            buttonText: 'Add LinkedIn',
            category: 'profile'
          },
          {
            id: 'create-resume',
            title: 'Create your first resume',
            description: 'A professional resume is essential for job applications.',
            xpReward: 50,
            progress: resumeCount > 0 ? 100 : 0,
            targetUrl: '/resume-builder',
            buttonText: 'Create Resume',
            category: 'resume'
          },
          {
            id: 'apply-job',
            title: 'Apply to your first job',
            description: 'Start your job search journey by submitting an application.',
            xpReward: 75,
            progress: applicationsCount > 0 ? 100 : 0,
            targetUrl: '/jobs',
            buttonText: 'Browse Jobs',
            category: 'application'
          }
        ];
        
        const incompleteTasks = tasks.filter(task => task.progress < 100);
        
        if (incompleteTasks.length === 0) {
          setPriorityTask({
            id: 'all-complete',
            title: 'Great job!',
            description: 'You\'ve completed all the initial tasks. Keep building your profile and applying to jobs!',
            xpReward: 0,
            progress: 100,
            targetUrl: '/jobs',
            buttonText: 'Browse More Jobs',
            category: 'application'
          });
        } else {
          const resumeTask = incompleteTasks.find(task => task.id === 'create-resume');
          if (resumeTask) {
            setPriorityTask(resumeTask);
          } else {
            const skillsTask = incompleteTasks.find(task => task.id === 'add-skills');
            if (skillsTask) {
              setPriorityTask(skillsTask);
            } else {
              const applicationTask = incompleteTasks.find(task => task.id === 'apply-job');
              if (applicationTask) {
                setPriorityTask(applicationTask);
              } else {
                setPriorityTask(incompleteTasks[0]);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error determining next task:", error);
      } finally {
        setLoading(false);
      }
    };
    
    determineNextTask();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Job Quest</h2>
      <Card>
        <CardHeader>
          <CardTitle>Priority Task</CardTitle>
          <CardDescription>Complete this task to unlock more job opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : priorityTask ? (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                {priorityTask.title}
                {priorityTask.progress > 0 && priorityTask.progress < 100 && (
                  <span className="text-sm font-normal ml-2">({priorityTask.progress}% complete)</span>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {priorityTask.description}
                {priorityTask.xpReward > 0 && ` Complete this task to earn ${priorityTask.xpReward} XP.`}
              </p>
              {priorityTask.id !== 'all-complete' && priorityTask.progress < 100 && (
                <Button onClick={() => navigate(priorityTask.targetUrl)}>
                  {priorityTask.buttonText}
                </Button>
              )}
              {priorityTask.id === 'all-complete' && (
                <Button onClick={() => navigate(priorityTask.targetUrl)}>
                  {priorityTask.buttonText}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              Could not determine next task. Please try refreshing the page.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
