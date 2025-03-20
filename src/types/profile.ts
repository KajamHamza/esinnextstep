
// Define a type for the user profile
export type Profile = {
  id: string;
  role: 'student' | 'employer';
  account_type: 'free' | 'premium';
};

// Student profile type
export type StudentProfileData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  education: string | null;
  skills: string[] | null;
  github_username: string | null;
  linkedin_url: string | null;
  profile_image_url: string | null;
  level: number;
  xp_points: number;
  career_goals: string[] | null;
  github_projects: any[] | null;
};

// Peer squad member type
export type PeerSquadMember = {
  peer_squad_id: string;
  joined_at: string;
  role: 'leader' | 'member';
  squad: {
    name: string;
    skill_focus: string[];
    created_at: string;
  };
};

// Achievement type
export type Achievement = {
  id: string;
  name: string;
  badge_image_url: string | null;
  description: string | null;
  earned_at: string;
  type: string;
  xp_awarded: number;
};
