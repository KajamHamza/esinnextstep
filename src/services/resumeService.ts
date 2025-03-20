/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
import { ResumeData, ResumeBasicInfo, ResumeEducation, ResumeExperience, ResumeSkills, ResumeProject } from '@/types/resume';
import { Json } from '@/integrations/supabase/types';

interface ResumeServiceInterface {
  getAIResumeAssistance(resume: ResumeData, prompt: string): Promise<string>;
  // other methods...
}

class ResumeService implements ResumeServiceInterface {
  async getAIResumeAssistance(resume: ResumeData, prompt: string): Promise<string> {
    // Use the standalone function that calls Supabase Edge Functions
    return getAIResumeAssistance(resume, prompt);
  }
  
  // Implement other methods as needed...
}

export const resumeService = new ResumeService();

export const fetchUserResumes = async (): Promise<ResumeData[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Convert database format to ResumeData format
  return data.map(item => {
    // Safely parse the JSON data
    const dbData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    
    return {
      id: item.id,
      user_id: item.user_id,
      title: item.name, // Use name field as title
      basic_info: dbData?.basic_info || {
        name: '',
        email: '',
        phone: '',
        location: ''
      },
      education: dbData?.education || [],
      experience: dbData?.experience || [],
      skills: dbData?.skills || { technical: [], soft: [], languages: [], certifications: [] },
      projects: dbData?.projects || [],
      created_at: item.created_at,
      updated_at: item.updated_at,
      is_primary: item.is_primary
    };
  });
};

export const fetchResumeById = async (resumeId: string): Promise<ResumeData> => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (error) throw error;
  
  // Convert database format to ResumeData format
  const dbData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
  
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.name,
    basic_info: dbData?.basic_info || {
      name: '',
      email: '',
      phone: '',
      location: ''
    },
    education: dbData?.education || [],
    experience: dbData?.experience || [],
    skills: dbData?.skills || { technical: [], soft: [] },
    projects: dbData?.projects || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_primary: data.is_primary
  };
};

export const saveResume = async (resume: ResumeData): Promise<ResumeData> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  // Convert ResumeData format to database format
  const dbData = {
    basic_info: resume.basic_info,
    education: resume.education,
    experience: resume.experience,
    skills: resume.skills,
    projects: resume.projects
  } as unknown as Json;

  // If resume has an ID, update it; otherwise, insert a new one
  if (resume.id) {
    const { data, error } = await supabase
      .from('resumes')
      .update({
        name: resume.title,
        data: dbData,
        is_primary: resume.is_primary,
        updated_at: new Date().toISOString()
      })
      .eq('id', resume.id)
      .select()
      .single();

    if (error) throw error;
    
    // Convert back to ResumeData format
    const responseData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
    
    return {
      id: data.id,
      user_id: data.user_id,
      title: data.name,
      basic_info: responseData?.basic_info || {
        name: '',
        email: '',
        phone: '',
        location: ''
      },
      education: responseData?.education || [],
      experience: responseData?.experience || [],
      skills: responseData?.skills || { technical: [], soft: [] },
      projects: responseData?.projects || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_primary: data.is_primary
    };
  } else {
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        name: resume.title,
        data: dbData,
        is_primary: resume.is_primary || false,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Convert back to ResumeData format
    const responseData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
    
    return {
      id: data.id,
      user_id: data.user_id,
      title: data.name,
      basic_info: responseData?.basic_info || {
        name: '',
        email: '',
        phone: '',
        location: ''
      },
      education: responseData?.education || [],
      experience: responseData?.experience || [],
      skills: responseData?.skills || { technical: [], soft: [] },
      projects: responseData?.projects || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_primary: data.is_primary
    };
  }
};

export const deleteResume = async (resumeId: string): Promise<void> => {
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId);

  if (error) throw error;
};

export const setPrimaryResume = async (resumeId: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  // First, set all resumes as not primary
  await supabase
    .from('resumes')
    .update({ is_primary: false })
    .eq('user_id', session.user.id);

  // Then set the specified resume as primary
  const { error } = await supabase
    .from('resumes')
    .update({ is_primary: true })
    .eq('id', resumeId);

  if (error) throw error;
};

export const getAIResumeAssistance = async (
  resumeData: Partial<ResumeData>,
  prompt: string
): Promise<string> => {
  try {
    console.log("Invoking Supabase Edge Function for AI assistance");
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated");

    // Format the resume data for better AI processing
    const formattedResume = formatResumeForAI(resumeData);
    console.log("Formatted resume for AI:", formattedResume);

    // Create a clearer prompt that explicitly mentions the resume content
    const enhancedPrompt = `Based on the following resume data:\n\n${formattedResume}\n\n${prompt}`;
    console.log("Enhanced prompt:", enhancedPrompt);

    const { data, error } = await supabase.functions.invoke('resume-ai', {
      body: {
        resume: resumeData,
        prompt: enhancedPrompt,
        // Adding an explicit flag to signal that resume data is already provided
        resumeProvided: true
      }
    });

    console.log("Edge function response:", data);
    
    if (error) {
      console.error("Edge function error:", error);
      throw error;
    }
    
    // Check for different response structures
    // The function might return either 'response' or 'result' property
    if (!data) {
      console.error("Empty response from Edge function");
      throw new Error("Empty response from AI assistant");
    }
    
    // Support both response formats
    const aiResponse = data.response || data.result;
    
    if (!aiResponse) {
      console.error("Invalid response format from Edge function:", data);
      throw new Error("Invalid response format from AI assistant");
    }
    
    console.log("Successfully extracted AI response:", aiResponse.substring(0, 100) + "...");
    
    return aiResponse;
  } catch (error: any) {
    console.error("Error in getAIResumeAssistance:", error);
    throw new Error(error.message || "Failed to get AI assistance");
  }
}

// Helper function to format resume data into a readable text format for the AI
const formatResumeForAI = (resume: Partial<ResumeData>): string => {
  let formattedText = '';
  
  // Basic Info
  if (resume.basic_info) {
    formattedText += "# BASIC INFORMATION\n";
    formattedText += `Name: ${resume.basic_info.name || 'Not provided'}\n`;
    formattedText += `Email: ${resume.basic_info.email || 'Not provided'}\n`;
    formattedText += `Phone: ${resume.basic_info.phone || 'Not provided'}\n`;
    formattedText += `Location: ${resume.basic_info.location || 'Not provided'}\n\n`;
  }
  
  // Education
  if (resume.education && resume.education.length > 0) {
    formattedText += "# EDUCATION\n";
    resume.education.forEach((edu, index) => {
      formattedText += `${index + 1}. ${edu.institution} - ${edu.degree} in ${edu.field || 'Not specified'}\n`;
      formattedText += `   ${edu.start_date || 'Start date not provided'} to ${edu.end_date || 'End date not provided'}\n`;
      formattedText += `   Location: ${edu.location || 'Not provided'}\n\n`;
    });
  }
  
  // Experience
  if (resume.experience && resume.experience.length > 0) {
    formattedText += "# EXPERIENCE\n";
    resume.experience.forEach((exp, index) => {
      formattedText += `${index + 1}. ${exp.position} at ${exp.company}\n`;
      formattedText += `   ${exp.start_date || 'Start date not provided'} to ${exp.end_date || 'End date not provided'}\n`;
      formattedText += `   Location: ${exp.location || 'Not provided'}\n`;
      formattedText += `   Description: ${exp.description || 'Not provided'}\n\n`;
    });
  }
  
  // Skills
  if (resume.skills) {
    formattedText += "# SKILLS\n";
    
    if (resume.skills.technical && resume.skills.technical.length > 0) {
      formattedText += "Technical Skills: " + resume.skills.technical.join(', ') + "\n";
    }
    
    if (resume.skills.soft && resume.skills.soft.length > 0) {
      formattedText += "Soft Skills: " + resume.skills.soft.join(', ') + "\n";
    }
    
    if (resume.skills.languages && resume.skills.languages.length > 0) {
      formattedText += "Languages: " + resume.skills.languages.join(', ') + "\n";
    }
    
    if (resume.skills.certifications && resume.skills.certifications.length > 0) {
      formattedText += "Certifications: " + resume.skills.certifications.join(', ') + "\n";
    }
    
    formattedText += "\n";
  }
  
  // Projects
  if (resume.projects && resume.projects.length > 0) {
    formattedText += "# PROJECTS\n";
    resume.projects.forEach((project, index) => {
      formattedText += `${index + 1}. ${project.title}\n`;
      formattedText += `   Description: ${project.description || 'Not provided'}\n`;
      if (project.technologies && project.technologies.length > 0) {
        formattedText += `   Technologies: ${project.technologies.join(', ')}\n`;
      }
      formattedText += "\n";
    });
  }
  
  return formattedText;
}

// Export a resumeService object for ease of use
export const resumeServiceOld = {
  getAllResumes: fetchUserResumes,
  getResumeById: fetchResumeById,
  saveResume,
  deleteResume,
  setPrimaryResume,
  getAIResumeAssistance
};
