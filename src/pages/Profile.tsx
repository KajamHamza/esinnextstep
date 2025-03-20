/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Pencil,
  Save,
  Github,
  Linkedin,
  FileText,
  PlusCircle,
  X,
  Globe
} from 'lucide-react';

// Define a type for the user profile
type Profile = {
  id: string;
  role: 'student' | 'employer';
  account_type: 'free' | 'premium';
};

// Student profile type
type StudentProfileData = {
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
};

// Employer profile type
type EmployerProfileData = {
  id: string;
  company_name: string;
  company_description: string | null;
  company_size: string | null;
  industry: string | null;
  company_location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  website_url: string | null;
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  
  // For student profile edit
  const [editingStudentProfile, setEditingStudentProfile] = useState<StudentProfileData | null>(null);
  
  // For employer profile edit
  const [editingEmployerProfile, setEditingEmployerProfile] = useState<EmployerProfileData | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        // Fetch profile data
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            toast({
              variant: "destructive",
              title: "Profile not found",
              description: "Please log in again",
            });
            navigate('/auth');
            return;
          }
          throw profileError;
        }
        
        setProfile(data as Profile);
        
        // Fetch role-specific profile data
        if (data.role === 'student') {
          const { data: studentData, error: studentError } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!studentError && studentData) {
            setStudentProfile(studentData as StudentProfileData);
            setEditingStudentProfile(studentData as StudentProfileData); // Initialize edit form
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load student profile data",
            });
          }
        } else if (data.role === 'employer') {
          const { data: employerData, error: employerError } = await supabase
            .from('employer_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!employerError && employerData) {
            setEmployerProfile(employerData as EmployerProfileData);
            setEditingEmployerProfile(employerData as EmployerProfileData); // Initialize edit form
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load employer profile data",
            });
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
  }, [navigate, toast]);
  
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
        // Update student profile
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
          })
          .eq('id', profile.id);
          
        if (error) throw error;
        
        // Update local state
        setStudentProfile(editingStudentProfile);
        
      } else if (profile?.role === 'employer' && editingEmployerProfile) {
        // Update employer profile
        const { error } = await supabase
          .from('employer_profiles')
          .update({
            company_name: editingEmployerProfile.company_name,
            company_description: editingEmployerProfile.company_description,
            company_size: editingEmployerProfile.company_size,
            industry: editingEmployerProfile.industry,
            company_location: editingEmployerProfile.company_location,
            contact_email: editingEmployerProfile.contact_email,
            contact_phone: editingEmployerProfile.contact_phone,
            website_url: editingEmployerProfile.website_url,
          })
          .eq('id', profile.id);
          
        if (error) throw error;
        
        // Update local state
        setEmployerProfile(editingEmployerProfile);
      }
      
      setEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    }
  };
  
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar 
        userRole={profile?.role || 'student'}
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <MobileHeader onLogout={handleLogout} />
        
        {/* Profile Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Your Profile</h1>
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
            </div>
            
            {profile?.role === 'student' && studentProfile && (
              <div className="space-y-6">
                {/* Student Profile Header Card */}
                <Card className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                  <CardContent className="relative pt-0 pb-6">
                    <div className="absolute -top-12 left-6">
                      <Avatar className="h-24 w-24 border-4 border-white">
                        <AvatarImage src={studentProfile.profile_image_url || ''} />
                        <AvatarFallback className="text-2xl bg-purple-200 text-purple-800">
                          {studentProfile.first_name ? studentProfile.first_name[0] : ''}
                          {studentProfile.last_name ? studentProfile.last_name[0] : ''}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="mt-14">
                      {editing ? (
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
                        <h2 className="text-2xl font-bold">
                          {studentProfile.first_name} {studentProfile.last_name}
                        </h2>
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
                      
                      {editing ? (
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
                
                {/* Student Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Education & Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Education</h3>
                      {editing ? (
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
                        <p className="text-muted-foreground">
                          {studentProfile.education || 'No education information added yet.'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Skills</h3>
                      {editing ? (
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
                    
                    {editing && (
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
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {profile?.role === 'employer' && employerProfile && (
              <div className="space-y-6">
                {/* Employer Profile Header Card */}
                <Card className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-600"></div>
                  <CardContent className="relative pt-0 pb-6">
                    <div className="absolute -top-12 left-6">
                      <Avatar className="h-24 w-24 border-4 border-white">
                        <AvatarImage src={employerProfile.logo_url || ''} />
                        <AvatarFallback className="text-2xl bg-blue-200 text-blue-800">
                          {employerProfile.company_name ? employerProfile.company_name[0] : 'C'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="mt-14">
                      {editing ? (
                        <div className="mb-4">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input 
                            id="companyName" 
                            value={editingEmployerProfile?.company_name || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              company_name: e.target.value
                            }) : null)}
                          />
                        </div>
                      ) : (
                        <h2 className="text-2xl font-bold">
                          {employerProfile.company_name}
                        </h2>
                      )}
                      
                      <div className="flex items-center mt-1 space-x-1 text-sm text-muted-foreground">
                        {employerProfile.industry && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {employerProfile.industry}
                          </Badge>
                        )}
                        {employerProfile.company_size && (
                          <Badge variant="outline">
                            {employerProfile.company_size} employees
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {profile.account_type === 'premium' ? 'Premium' : 'Free'} Account
                        </Badge>
                      </div>
                      
                      {editing ? (
                        <div className="mt-4">
                          <Label htmlFor="companyDescription">Company Description</Label>
                          <Textarea 
                            id="companyDescription" 
                            className="mt-1"
                            value={editingEmployerProfile?.company_description || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              company_description: e.target.value
                            }) : null)}
                          />
                        </div>
                      ) : (
                        <p className="mt-4 text-muted-foreground">
                          {employerProfile.company_description || 'No company description added yet.'}
                        </p>
                      )}
                      
                      {employerProfile.website_url && (
                        <a 
                          href={employerProfile.website_url.startsWith('http') ? employerProfile.website_url : `https://${employerProfile.website_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center mt-4 text-sm text-slate-500 hover:text-slate-800"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          {employerProfile.website_url}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Employer Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Input 
                            id="industry" 
                            value={editingEmployerProfile?.industry || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              industry: e.target.value
                            }) : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="companySize">Company Size</Label>
                          <Input 
                            id="companySize" 
                            value={editingEmployerProfile?.company_size || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              company_size: e.target.value
                            }) : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location" 
                            value={editingEmployerProfile?.company_location || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              company_location: e.target.value
                            }) : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactEmail">Contact Email</Label>
                          <Input 
                            id="contactEmail" 
                            type="email"
                            value={editingEmployerProfile?.contact_email || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              contact_email: e.target.value
                            }) : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPhone">Contact Phone</Label>
                          <Input 
                            id="contactPhone" 
                            value={editingEmployerProfile?.contact_phone || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              contact_phone: e.target.value
                            }) : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website URL</Label>
                          <Input 
                            id="website" 
                            value={editingEmployerProfile?.website_url || ''} 
                            onChange={(e) => setEditingEmployerProfile(prev => prev ? ({
                              ...prev,
                              website_url: e.target.value
                            }) : null)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {employerProfile.company_location && (
                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 mt-0.5 mr-3 text-slate-500" />
                            <div>
                              <h3 className="text-sm font-medium">Location</h3>
                              <p className="text-muted-foreground">{employerProfile.company_location}</p>
                            </div>
                          </div>
                        )}
                        
                        {employerProfile.contact_email && (
                          <div className="flex items-start">
                            <Mail className="w-5 h-5 mt-0.5 mr-3 text-slate-500" />
                            <div>
                              <h3 className="text-sm font-medium">Contact Email</h3>
                              <p className="text-muted-foreground">{employerProfile.contact_email}</p>
                            </div>
                          </div>
                        )}
                        
                        {employerProfile.contact_phone && (
                          <div className="flex items-start">
                            <Phone className="w-5 h-5 mt-0.5 mr-3 text-slate-500" />
                            <div>
                              <h3 className="text-sm font-medium">Contact Phone</h3>
                              <p className="text-muted-foreground">{employerProfile.contact_phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
