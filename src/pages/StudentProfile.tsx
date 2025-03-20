
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { resumeService } from '@/services/resumeService';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BannerUpload } from '@/components/profile/BannerUpload';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { Profile, StudentProfileData, Achievement, PeerSquadMember } from '@/types/profile';
import { ResumeData } from '@/types/resume';

const StudentProfile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [peerSquads, setPeerSquads] = useState<PeerSquadMember[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerProgress, setBannerProgress] = useState(0);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  
  const [editingStudentProfile, setEditingStudentProfile] = useState<StudentProfileData | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        const profileId = userId || session.user.id;
        setIsCurrentUser(profileId === session.user.id);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            toast({
              variant: "destructive",
              title: "Profile not found",
              description: "The requested profile does not exist",
            });
            navigate('/dashboard');
            return;
          }
          throw profileError;
        }
        
        setProfile(data as Profile);
        
        if (data.role === 'student') {
          const { data: studentData, error: studentError } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', profileId)
            .single();
            
          if (!studentError && studentData) {
            setStudentProfile(studentData as StudentProfileData);
            setEditingStudentProfile(studentData as StudentProfileData);
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load student profile data",
            });
          }

          try {
            if (isCurrentUser) {
              const userResumes = await resumeService.getAllResumes();
              setResumes(userResumes);
            }
          } catch (err) {
            console.error("Failed to load resumes:", err);
          }

          try {
            const { data: squadData, error: squadError } = await supabase
              .from('peer_squad_members')
              .select(`
                peer_squad_id,
                joined_at,
                role,
                peer_squads:peer_squad_id (
                  name,
                  skill_focus,
                  created_at
                )
              `)
              .eq('student_id', profileId);

            if (!squadError && squadData) {
              setPeerSquads(squadData.map(item => ({
                peer_squad_id: item.peer_squad_id,
                joined_at: item.joined_at,
                role: item.role as 'leader' | 'member',
                squad: {
                  name: item.peer_squads.name,
                  skill_focus: item.peer_squads.skill_focus,
                  created_at: item.peer_squads.created_at
                }
              })));
            }
          } catch (err) {
            console.error("Failed to load peer squads:", err);
          }

          try {
            const { data: achievementData, error: achievementError } = await supabase
              .from('achievements')
              .select('*')
              .eq('user_id', profileId)
              .order('earned_at', { ascending: false });

            if (!achievementError && achievementData) {
              setAchievements(achievementData as Achievement[]);
            }
          } catch (err) {
            console.error("Failed to load achievements:", err);
          }
        }
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Please log in again",
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast, userId]);
  
  const handleAvatarUpload = async (file: File) => {
    try {
      if (!profile) return;
      
      setUploadingAvatar(true);
      setAvatarProgress(0);
      setAvatarError(null);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('student_profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', profile.id);
      
      if (updateError) throw updateError;
      
      if (studentProfile && editingStudentProfile) {
        setStudentProfile({
          ...studentProfile,
          profile_image_url: publicUrl
        });
        setEditingStudentProfile({
          ...editingStudentProfile,
          profile_image_url: publicUrl
        });
      }
      
      setAvatarProgress(100);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setAvatarError(error.message || "Failed to upload profile picture");
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const handleBannerUpload = async (file: File) => {
    try {
      if (!profile) return;
      
      setUploadingBanner(true);
      setBannerProgress(0);
      setBannerError(null);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-banner-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-banners/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setBannerUrl(publicUrl);
      
      setBannerProgress(100);
      
      toast({
        title: "Banner updated",
        description: "Your profile banner has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      setBannerError(error.message || "Failed to upload banner");
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload banner",
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  const resetAvatarUpload = () => {
    setAvatarError(null);
    if (studentProfile) {
      setStudentProfile({
        ...studentProfile,
        profile_image_url: null
      });
      if (editingStudentProfile) {
        setEditingStudentProfile({
          ...editingStudentProfile,
          profile_image_url: null
        });
      }
    }
  };
  
  const resetBannerUpload = () => {
    setBannerError(null);
    setBannerUrl(null);
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      });
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      if (profile?.role === 'student' && editingStudentProfile) {
        const { error } = await supabase
          .from('student_profiles')
          .update({
            first_name: editingStudentProfile.first_name,
            last_name: editingStudentProfile.last_name,
            bio: editingStudentProfile.bio,
            education: editingStudentProfile.education,
            skills: editingStudentProfile.skills,
            github_username: editingStudentProfile.github_username,
            linkedin_url: editingStudentProfile.linkedin_url,
            career_goals: editingStudentProfile.career_goals,
          })
          .eq('id', profile.id);
          
        if (error) throw error;
        
        setStudentProfile(editingStudentProfile);
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }
      
      setEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <Sidebar 
        userRole={profile?.role || 'student'}
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <MobileHeader onLogout={handleLogout} />
        
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <ProfileHeader 
              isCurrentUser={isCurrentUser}
              profile={profile}
              studentProfile={studentProfile}
              editing={editing}
              setEditing={setEditing}
              handleSaveProfile={handleSaveProfile}
            />
            
            {profile?.role === 'student' && studentProfile && (
              <div className="space-y-6">
                {isCurrentUser && editing && (
                  <BannerUpload 
                    handleBannerUpload={handleBannerUpload}
                    uploadingBanner={uploadingBanner}
                    bannerProgress={bannerProgress}
                    bannerError={bannerError}
                    bannerUrl={bannerUrl}
                    resetBannerUpload={resetBannerUpload}
                  />
                )}
                
                <ProfileCard 
                  studentProfile={studentProfile}
                  profile={profile}
                  isCurrentUser={isCurrentUser}
                  editing={editing}
                  editingStudentProfile={editingStudentProfile}
                  setEditingStudentProfile={setEditingStudentProfile}
                  handleAvatarUpload={handleAvatarUpload}
                  isVerified={studentProfile.level >= 10}
                />
                
                <ProfileTabs 
                  studentProfile={studentProfile}
                  profile={profile}
                  editing={editing}
                  isCurrentUser={isCurrentUser}
                  editingStudentProfile={editingStudentProfile}
                  setEditingStudentProfile={setEditingStudentProfile}
                  achievements={achievements}
                  peerSquads={peerSquads}
                  resumes={resumes}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
