
export interface ResumeData {
  id?: string;
  user_id?: string;
  title: string;
  basic_info: ResumeBasicInfo;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  skills: ResumeSkills;
  projects: ResumeProject[];
  created_at?: string;
  updated_at?: string;
  is_primary?: boolean;
}

export interface ResumeBasicInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  location?: string;
  gpa?: string;
  achievements?: string[];
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  location?: string;
  description: string;
  achievements?: string[];
}

export interface ResumeSkills {
  technical: string[];
  soft: string[];
  languages?: string[];
  certifications?: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github_link?: string;
}
