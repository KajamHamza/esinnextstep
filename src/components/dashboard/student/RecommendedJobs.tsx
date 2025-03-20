
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
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, ThumbsUp, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  skills_required: string[];
  matchPercentage: number;
}

export const RecommendedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Fetch user skills
        const { data: profile, error: profileError } = await supabase
          .from('student_profiles')
          .select('skills')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const skills = profile?.skills || [];
        setUserSkills(skills);
        
        // Fetch active jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .limit(10);
          
        if (jobsError) throw jobsError;
        
        // Calculate match percentage based on skills
        const jobsWithMatch = jobsData?.map(job => {
          let matchCount = 0;
          let matchPercentage = 0;
          
          if (skills && skills.length > 0 && job.skills_required && job.skills_required.length > 0) {
            // Count matching skills
            matchCount = skills.filter(skill => 
              job.skills_required.some(jobSkill => 
                jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
                skill.toLowerCase().includes(jobSkill.toLowerCase())
              )
            ).length;
            
            // Calculate percentage
            matchPercentage = Math.round((matchCount / job.skills_required.length) * 100);
            if (matchPercentage > 100) matchPercentage = 100;
          }
          
          return {
            ...job,
            matchPercentage
          };
        }) || [];
        
        // Sort by match percentage (highest first)
        jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
        setJobs(jobsWithMatch.slice(0, 3));  // Take top 3 matches
        
      } catch (error: any) {
        console.error("Error fetching recommended jobs:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load recommended jobs"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedJobs();
  }, [toast]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
          Recommended Jobs
        </CardTitle>
        <CardDescription>
          Jobs that match your skills and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map(job => (
                <div key={job.id} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{job.title}</h3>
                    <Badge 
                      variant={
                        job.matchPercentage >= 80 ? "default" : 
                        job.matchPercentage >= 50 ? "secondary" : "outline"
                      }
                      className={
                        job.matchPercentage >= 80 ? "bg-green-500" : 
                        job.matchPercentage >= 50 ? "bg-blue-500" : ""
                      }
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {job.matchPercentage}% Match
                    </Badge>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm mt-2">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="mr-4">{job.company}</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs font-normal">
                      {job.job_type}
                    </Badge>
                    {job.skills_required.slice(0, 2).map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className={`text-xs font-normal ${
                          userSkills.some(userSkill => 
                            userSkill.toLowerCase().includes(skill.toLowerCase()) || 
                            skill.toLowerCase().includes(userSkill.toLowerCase())
                          ) ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : ''
                        }`}
                      >
                        {skill}
                      </Badge>
                    ))}
                    {job.skills_required.length > 2 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{job.skills_required.length - 2} more
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(`/jobs/${job.id}`)} 
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">No matching jobs found</p>
                <p className="text-sm text-muted-foreground mb-4">Update your skills to get better job recommendations</p>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  Update Skills
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/jobs')}
            >
              View All Jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
