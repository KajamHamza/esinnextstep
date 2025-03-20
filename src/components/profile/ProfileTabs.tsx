
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AboutSection } from './about/AboutSection';
import { AchievementsSection } from './achievements/AchievementsSection';
import { PeerSquadsSection } from './squads/PeerSquadsSection';
import { ResumesSection } from './resumes/ResumesSection';
import { Profile, StudentProfileData, Achievement, PeerSquadMember } from "@/types/profile";
import { ResumeData } from '@/types/resume';

interface ProfileTabsProps {
  studentProfile: StudentProfileData;
  profile: Profile;
  editing: boolean;
  isCurrentUser: boolean;
  editingStudentProfile: StudentProfileData | null;
  setEditingStudentProfile: (profile: StudentProfileData | null) => void;
  achievements: Achievement[];
  peerSquads: PeerSquadMember[];
  resumes: ResumeData[];
}

export const ProfileTabs = ({
  studentProfile,
  profile,
  editing,
  isCurrentUser,
  editingStudentProfile,
  setEditingStudentProfile,
  achievements,
  peerSquads,
  resumes
}: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="about" className="space-y-6">
      <TabsList className="grid grid-cols-4 md:w-[600px]">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="achievements">Achievements</TabsTrigger>
        <TabsTrigger value="squads">Peer Squads</TabsTrigger>
        <TabsTrigger value="resumes">Resumes</TabsTrigger>
      </TabsList>
      
      {/* About Section */}
      <TabsContent value="about" className="space-y-6">
        <AboutSection 
          studentProfile={studentProfile}
          editing={editing}
          isCurrentUser={isCurrentUser}
          editingStudentProfile={editingStudentProfile}
          setEditingStudentProfile={setEditingStudentProfile}
        />
      </TabsContent>
      
      {/* Achievements Section */}
      <TabsContent value="achievements" className="space-y-6">
        <AchievementsSection achievements={achievements} />
      </TabsContent>
      
      {/* Peer Squads Section */}
      <TabsContent value="squads" className="space-y-6">
        <PeerSquadsSection peerSquads={peerSquads} />
      </TabsContent>
      
      {/* Resumes Section */}
      <TabsContent value="resumes" className="space-y-6">
        <ResumesSection resumes={resumes} />
      </TabsContent>
    </Tabs>
  );
};
