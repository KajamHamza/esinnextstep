
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentProfileData } from "@/types/profile";

interface SocialLinksEditorProps {
  editingStudentProfile: StudentProfileData | null;
  setEditingStudentProfile: (profile: StudentProfileData | null) => void;
}

export const SocialLinksEditor = ({
  editingStudentProfile,
  setEditingStudentProfile
}: SocialLinksEditorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="github">GitHub Username</Label>
        <Input 
          id="github" 
          value={editingStudentProfile?.github_username || ''} 
          onChange={(e) => setEditingStudentProfile(prev => prev ? ({
            ...prev,
            github_username: e.target.value
          }) : null)}
          placeholder="Your GitHub username"
        />
      </div>
      <div>
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input 
          id="linkedin" 
          value={editingStudentProfile?.linkedin_url || ''} 
          onChange={(e) => setEditingStudentProfile(prev => prev ? ({
            ...prev,
            linkedin_url: e.target.value
          }) : null)}
          placeholder="Your LinkedIn profile URL"
        />
      </div>
    </div>
  );
};
