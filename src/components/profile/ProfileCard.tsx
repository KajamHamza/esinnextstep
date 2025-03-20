
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  CheckCircle, 
  Github, 
  Linkedin 
} from 'lucide-react';
import { Profile, StudentProfileData } from "@/types/profile";

interface ProfileCardProps {
  studentProfile: StudentProfileData;
  profile: Profile;
  bannerUrl: string | null;
  isCurrentUser: boolean;
  editing: boolean;
  editingStudentProfile: StudentProfileData | null;
  setEditingStudentProfile: (profile: StudentProfileData | null) => void;
  handleAvatarUpload: (file: File) => Promise<void>;
}

export const ProfileCard = ({
  studentProfile,
  profile,
  bannerUrl,
  isCurrentUser,
  editing,
  editingStudentProfile,
  setEditingStudentProfile,
  handleAvatarUpload
}: ProfileCardProps) => {
  const isVerified = studentProfile?.level && studentProfile.level >= 10;

  return (
    <Card className="overflow-hidden">
      <div 
        className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600" 
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      ></div>
      <CardContent className="relative pt-16 pb-6">
        <div className="absolute -top-16 left-6">
          {isCurrentUser && editing ? (
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={studentProfile.profile_image_url || ''} />
                <AvatarFallback className="text-2xl bg-purple-200 text-purple-800">
                  {studentProfile.first_name ? studentProfile.first_name[0] : ''}
                  {studentProfile.last_name ? studentProfile.last_name[0] : ''}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="rounded-full h-8 w-8 p-0"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </div>
            </div>
          ) : (
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={studentProfile.profile_image_url || ''} />
              <AvatarFallback className="text-2xl bg-purple-200 text-purple-800">
                {studentProfile.first_name ? studentProfile.first_name[0] : ''}
                {studentProfile.last_name ? studentProfile.last_name[0] : ''}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <div className="mt-2">
          {editing && isCurrentUser ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={editingStudentProfile?.first_name || ''} 
                  onChange={(e) => setEditingStudentProfile(prev => prev ? ({
                    ...prev,
                    first_name: e.target.value
                  }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={editingStudentProfile?.last_name || ''} 
                  onChange={(e) => setEditingStudentProfile(prev => prev ? ({
                    ...prev,
                    last_name: e.target.value
                  }) : null)}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">
                {studentProfile.first_name} {studentProfile.last_name}
              </h2>
              {isVerified && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 inline-flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center mt-1 space-x-1 text-sm text-muted-foreground">
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Level {studentProfile.level}
            </Badge>
            <Badge variant="outline">
              {studentProfile.xp_points} XP
            </Badge>
            <Badge variant="outline">
              {profile.account_type === 'premium' ? 'Premium' : 'Free'} Account
            </Badge>
          </div>
          
          {editing && isCurrentUser ? (
            <div className="mt-4">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                className="mt-1"
                value={editingStudentProfile?.bio || ''} 
                onChange={(e) => setEditingStudentProfile(prev => prev ? ({
                  ...prev,
                  bio: e.target.value
                }) : null)}
              />
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground">
              {studentProfile.bio || 'No bio added yet.'}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 mt-4">
            {studentProfile.github_username && (
              <a 
                href={`https://github.com/${studentProfile.github_username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-slate-500 hover:text-slate-800"
              >
                <Github className="w-4 h-4 mr-1" />
                {studentProfile.github_username}
              </a>
            )}
            {studentProfile.linkedin_url && (
              <a 
                href={studentProfile.linkedin_url.startsWith('http') ? studentProfile.linkedin_url : `https://${studentProfile.linkedin_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-slate-500 hover:text-slate-800"
              >
                <Linkedin className="w-4 h-4 mr-1" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
