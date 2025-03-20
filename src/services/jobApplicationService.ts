
import { supabase } from '@/integrations/supabase/client';

export interface JobApplication {
  id?: string;
  job_id: string;
  student_id?: string;
  resume_id?: string;
  cover_letter?: string;
  status: 'applied' | 'in_review' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  applied_at?: string;
  updated_at?: string;
  jobs?: {
    title: string;
    company: string;
    location: string;
    job_type: string;
  };
}

export const fetchUserApplications = async (): Promise<JobApplication[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs:job_id (title, company, location, job_type)
    `)
    .eq('student_id', session.user.id)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  
  // Convert to proper type
  return data.map(item => ({
    id: item.id,
    job_id: item.job_id,
    student_id: item.student_id,
    resume_id: item.resume_id,
    cover_letter: item.cover_letter,
    status: item.status as JobApplication['status'],
    applied_at: item.applied_at,
    updated_at: item.updated_at,
    jobs: item.jobs
  }));
};

export const submitJobApplication = async (application: JobApplication): Promise<JobApplication> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: application.job_id,
      student_id: session.user.id,
      resume_id: application.resume_id,
      cover_letter: application.cover_letter,
      status: application.status || 'applied',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    job_id: data.job_id,
    student_id: data.student_id,
    resume_id: data.resume_id,
    cover_letter: data.cover_letter,
    status: data.status as JobApplication['status'],
    applied_at: data.applied_at,
    updated_at: data.updated_at
  };
};

export const updateJobApplication = async (id: string, updates: Partial<JobApplication>): Promise<JobApplication> => {
  const { data, error } = await supabase
    .from('job_applications')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    job_id: data.job_id,
    student_id: data.student_id,
    resume_id: data.resume_id,
    cover_letter: data.cover_letter,
    status: data.status as JobApplication['status'],
    applied_at: data.applied_at,
    updated_at: data.updated_at
  };
};

export const withdrawJobApplication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('job_applications')
    .update({
      status: 'withdrawn',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
};
