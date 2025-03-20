
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  JobApplication, 
  fetchUserApplications, 
  submitJobApplication, 
  updateJobApplication, 
  withdrawJobApplication 
} from '@/services/jobApplicationService';

export function useJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchUserApplications();
      setApplications(data);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        variant: "destructive",
        title: "Error loading applications",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (application: JobApplication) => {
    try {
      setSubmitting(true);
      const result = await submitJobApplication(application);
      
      // Update the applications list
      setApplications(prev => [result, ...prev]);
      
      toast({
        title: "Application submitted",
        description: "Your job application has been submitted successfully",
      });
      
      return result;
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        variant: "destructive",
        title: "Error submitting application",
        description: error.message,
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateApplication = async (id: string, updates: Partial<JobApplication>) => {
    try {
      const updatedApplication = await updateJobApplication(id, updates);
      
      // Update the applications list
      setApplications(prev => 
        prev.map(app => app.id === id ? updatedApplication : app)
      );
      
      toast({
        title: "Application updated",
        description: "Your job application has been updated",
      });
      
      return updatedApplication;
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast({
        variant: "destructive",
        title: "Error updating application",
        description: error.message,
      });
      throw error;
    }
  };

  const withdrawApplication = async (id: string) => {
    try {
      await withdrawJobApplication(id);
      
      // Update the applications list
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: 'withdrawn' } : app)
      );
      
      toast({
        title: "Application withdrawn",
        description: "Your job application has been withdrawn",
      });
    } catch (error: any) {
      console.error('Error withdrawing application:', error);
      toast({
        variant: "destructive",
        title: "Error withdrawing application",
        description: error.message,
      });
    }
  };

  return {
    applications,
    loading,
    submitting,
    fetchApplications,
    applyToJob,
    updateApplication,
    withdrawApplication,
  };
}
