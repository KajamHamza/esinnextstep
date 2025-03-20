
import { PlusCircle, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { StudentProfileData } from "@/types/profile";

interface CareerGoalsSectionProps {
  studentProfile: StudentProfileData;
  editing: boolean;
  isCurrentUser: boolean;
  editingStudentProfile: StudentProfileData | null;
  setEditingStudentProfile: (profile: StudentProfileData | null) => void;
}

export const CareerGoalsSection = ({
  studentProfile,
  editing,
  isCurrentUser,
  editingStudentProfile,
  setEditingStudentProfile
}: CareerGoalsSectionProps) => {
  const [newGoal, setNewGoal] = useState("");

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    
    if (editingStudentProfile && editingStudentProfile.career_goals) {
      setEditingStudentProfile({
        ...editingStudentProfile,
        career_goals: [...editingStudentProfile.career_goals, newGoal.trim()]
      });
    } else if (editingStudentProfile) {
      setEditingStudentProfile({
        ...editingStudentProfile,
        career_goals: [newGoal.trim()]
      });
    }
    
    setNewGoal("");
  };
  
  const handleRemoveGoal = (goal: string) => {
    if (editingStudentProfile && editingStudentProfile.career_goals) {
      setEditingStudentProfile({
        ...editingStudentProfile,
        career_goals: editingStudentProfile.career_goals.filter(g => g !== goal)
      });
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Career Goals</h3>
      {editing && isCurrentUser ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {editingStudentProfile?.career_goals?.map(goal => (
              <Badge key={goal} variant="outline" className="flex items-center gap-1">
                {goal}
                <button 
                  onClick={() => handleRemoveGoal(goal)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newGoal} 
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a career goal"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGoal();
                }
              }}
            />
            <Button onClick={handleAddGoal}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {studentProfile.career_goals && studentProfile.career_goals.length > 0 ? (
            studentProfile.career_goals.map(goal => (
              <Badge key={goal} variant="outline">
                {goal}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No career goals added yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
