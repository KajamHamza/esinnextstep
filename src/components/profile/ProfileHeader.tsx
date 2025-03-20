
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Pencil, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Profile, StudentProfileData } from "@/types/profile";

interface ProfileHeaderProps {
  isCurrentUser: boolean;
  profile: Profile | null;
  studentProfile: StudentProfileData | null;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  handleSaveProfile: () => Promise<void>;
}

export const ProfileHeader = ({
  isCurrentUser,
  profile,
  studentProfile,
  editing,
  setEditing,
  handleSaveProfile
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  
  if (!isCurrentUser) return null;
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            if (editing) {
              handleSaveProfile();
            } else {
              setEditing(true);
            }
          }}
          className={editing ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {editing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/settings')}
        >
          Settings
        </Button>
      </div>
    </div>
  );
};
