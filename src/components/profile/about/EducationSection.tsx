
import { GraduationCap } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { StudentProfileData } from "@/types/profile";

interface EducationSectionProps {
  studentProfile: StudentProfileData;
  editing: boolean;
  isCurrentUser: boolean;
  editingStudentProfile: StudentProfileData | null;
  setEditingStudentProfile: (profile: StudentProfileData | null) => void;
}

export const EducationSection = ({
  studentProfile,
  editing,
  isCurrentUser,
  editingStudentProfile,
  setEditingStudentProfile
}: EducationSectionProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Education</h3>
      {editing && isCurrentUser ? (
        <div>
          <Textarea 
            value={editingStudentProfile?.education || ''} 
            onChange={(e) => setEditingStudentProfile(prev => prev ? ({
              ...prev,
              education: e.target.value
            }) : null)}
            placeholder="Add your education details"
          />
        </div>
      ) : (
        <div className="flex items-start">
          <GraduationCap className="w-5 h-5 mt-0.5 mr-3 text-slate-500" />
          <p className="text-muted-foreground">
            {studentProfile.education || 'No education information added yet.'}
          </p>
        </div>
      )}
    </div>
  );
};
