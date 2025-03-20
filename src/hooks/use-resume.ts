import { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';
import { useToast } from '@/hooks/use-toast';
import { fetchUserResumes, fetchResumeById, saveResume, deleteResume, setPrimaryResume } from '@/services/resumeService';

const DEFAULT_RESUME: ResumeData = {
  title: 'Untitled Resume',
  basic_info: {
    name: '',
    email: '',
    phone: '',
    location: '',
  },
  education: [],
  experience: [],
  skills: {
    technical: [],
    soft: [],
  },
  projects: [],
};

export function useResume(resumeId?: string) {
  const [resume, setResume] = useState<ResumeData>(DEFAULT_RESUME);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadResumes() {
      try {
        setLoading(true);
        const userResumes = await fetchUserResumes();
        setResumes(userResumes);

        // If resumeId is provided, load that specific resume
        if (resumeId) {
          const specificResume = await fetchResumeById(resumeId);
          setResume(specificResume);
        } 
        // Otherwise, load the most recent resume or create a new one
        else if (userResumes.length > 0) {
          // Find the primary resume if it exists
          const primaryResume = userResumes.find(r => r.is_primary);
          if (primaryResume) {
            setResume(primaryResume);
          } else {
            // Otherwise use the most recent one
            setResume(userResumes[0]);
          }
        } else {
          // No resumes exist yet
          setResume(DEFAULT_RESUME);
        }
      } catch (error: any) {
        console.error('Error loading resumes:', error);
        toast({
          variant: "destructive",
          title: "Error loading resumes",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, [resumeId, toast]);

  const handleSaveResume = async (newResumeData?: Partial<ResumeData>) => {
    try {
      setSaving(true);
      const resumeToSave = {
        ...resume,
        ...newResumeData,
      };
      const savedResume = await saveResume(resumeToSave);
      
      setResume(savedResume);
      
      // Update the resumes list
      setResumes(prevResumes => {
        const existingIndex = prevResumes.findIndex(r => r.id === savedResume.id);
        if (existingIndex >= 0) {
          // Update existing resume
          const updatedResumes = [...prevResumes];
          updatedResumes[existingIndex] = savedResume;
          return updatedResumes;
        } else {
          // Add new resume
          return [savedResume, ...prevResumes];
        }
      });
      
      toast({
        title: "Resume saved",
        description: "Your resume has been saved successfully",
      });
      
      return savedResume;
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast({
        variant: "destructive",
        title: "Error saving resume",
        description: error.message,
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await deleteResume(id);
      
      // Update the resumes list
      setResumes(prevResumes => prevResumes.filter(r => r.id !== id));
      
      // If the current resume was deleted, switch to another one or create a new one
      if (resume.id === id) {
        if (resumes.length > 1) {
          const nextResume = resumes.find(r => r.id !== id);
          if (nextResume) setResume(nextResume);
        } else {
          setResume(DEFAULT_RESUME);
        }
      }
      
      toast({
        title: "Resume deleted",
        description: "The resume has been deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      toast({
        variant: "destructive",
        title: "Error deleting resume",
        description: error.message,
      });
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryResume(id);
      
      // Update the resumes list to reflect the primary status
      setResumes(prevResumes => 
        prevResumes.map(r => ({
          ...r,
          is_primary: r.id === id
        }))
      );
      
      toast({
        title: "Primary resume set",
        description: "This resume will be used as your default resume for job applications",
      });
    } catch (error: any) {
      console.error('Error setting primary resume:', error);
      toast({
        variant: "destructive",
        title: "Error setting primary resume",
        description: error.message,
      });
    }
  };

  const updateResumeSection = <K extends keyof ResumeData>(
    section: K, 
    data: ResumeData[K]
  ) => {
    setResume(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return {
    resume,
    resumes,
    loading,
    saving,
    updateResumeSection,
    saveResume: handleSaveResume,
    deleteResume: handleDeleteResume,
    setPrimaryResume: handleSetPrimary,
  };
}
