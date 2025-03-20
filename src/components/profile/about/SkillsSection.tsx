
import { PlusCircle, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { StudentProfileData } from "@/types/profile";

interface SkillsSectionProps {
  studentProfile: StudentProfileData;
  editing: boolean;
  isCurrentUser: boolean;
  editingStudentProfile: StudentProfileData | null;
  setEditingStudentProfile: (profile: StudentProfileData | null) => void;
}

export const SkillsSection = ({
  studentProfile,
  editing,
  isCurrentUser,
  editingStudentProfile,
  setEditingStudentProfile
}: SkillsSectionProps) => {
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    if (editingStudentProfile && editingStudentProfile.skills) {
      setEditingStudentProfile({
        ...editingStudentProfile,
        skills: [...editingStudentProfile.skills, newSkill.trim()]
      });
    } else if (editingStudentProfile) {
      setEditingStudentProfile({
        ...editingStudentProfile,
        skills: [newSkill.trim()]
      });
    }
    
    setNewSkill("");
  };
  
  const handleRemoveSkill = (skill: string) => {
    if (editingStudentProfile && editingStudentProfile.skills) {
      setEditingStudentProfile({
        ...editingStudentProfile,
        skills: editingStudentProfile.skills.filter(s => s !== skill)
      });
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Skills</h3>
      {editing && isCurrentUser ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {editingStudentProfile?.skills?.map(skill => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button 
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a new skill"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <Button onClick={handleAddSkill}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {studentProfile.skills && studentProfile.skills.length > 0 ? (
            studentProfile.skills.map(skill => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No skills added yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
