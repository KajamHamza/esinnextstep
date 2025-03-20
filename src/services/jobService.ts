import { supabase } from "@/integrations/supabase/client";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  salary_range: string | null;
  job_type: string;
  experience_level: string | null;
  education_level: string | null;
  posted_at: string;
  expires_at: string | null;
  status: string;
}

export const jobService = {
  async getRecommendedJobs(): Promise<(Job & { matchScore: number })[]> {
    try {
      const { data: userSkills } = await supabase
        .from('student_profiles')
        .select('skills')
        .single();

      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('posted_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      // Simple skill matching algorithm
      const matchedJobs = jobs.map(job => {
        const matchScore = userSkills?.skills?.filter(skill => 
          job.skills_required.includes(skill)
        ).length || 0;
        return { ...job, matchScore: (matchScore / (job.skills_required.length || 1)) * 100 };
      }).sort((a, b) => b.matchScore - a.matchScore);

      return matchedJobs;
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      return [];
    }
  },
  
  async getJobById(jobId: string): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching job details:', error);
      return null;
    }
  },
  
  async getAllJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('posted_at', { ascending: false });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  async applyToJob(jobId: string, resumeId: string | null, coverLetter?: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          student_id: session.user.id,
          resume_id: resumeId,
          cover_letter: coverLetter,
          status: 'applied'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error applying to job:', error);
      return false;
    }
  },

  // Update this method to use Supabase instead of fetch
  async checkApplicationStatus(jobId: string): Promise<{ applied: boolean }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { applied: false };

      const { data, error } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('student_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      
      return { applied: !!data };
    } catch (error) {
      console.error('Error checking application status:', error);
      // Default to not applied if there's an error
      return { applied: false };
    }
  }
};
