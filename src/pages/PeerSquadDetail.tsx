
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "../components/dashboard/Sidebar";
import { MobileHeader } from "../components/dashboard/MobileHeader";
import { SquadActivities } from "../components/peer-squad/SquadActivities";
import { Code, Users } from "lucide-react";
import { PeerSquad, SquadMember } from "@/types/database";

const PeerSquadDetail = () => {
  const { squadId } = useParams<{ squadId: string }>();
  const [squad, setSquad] = useState<PeerSquad | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!squadId) return;
    
    const fetchSquadDetails = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please log in to view squad details"
          });
          navigate('/auth');
          return;
        }
        
        // Fetch squad details
        const { data: squadData, error: squadError } = await supabase
          .from('peer_squads')
          .select('*')
          .eq('id', squadId)
          .single();
          
        if (squadError) throw squadError;
        
        // Fetch squad members
        const { data: membersData, error: membersError } = await supabase
          .from('peer_squad_members')
          .select(`
            id,
            student_id,
            role,
            joined_at,
            peer_squad_id
          `)
          .eq('peer_squad_id', squadId);
          
        if (membersError) throw membersError;
        
        // Get member profiles separately
        const members: SquadMember[] = [];
        if (membersData) {
          for (const member of membersData) {
            const { data: profileData } = await supabase
              .from('student_profiles')
              .select('first_name, last_name, profile_image_url')
              .eq('id', member.student_id)
              .single();
              
            members.push({
              id: member.id,
              student_id: member.student_id,
              role: member.role,
              joined_at: member.joined_at,
              peer_squad_id: member.peer_squad_id,
              student: {
                first_name: profileData?.first_name || '',
                last_name: profileData?.last_name || '',
                profile_image_url: profileData?.profile_image_url || ''
              }
            });
          }
        }
        
        const fullSquad: PeerSquad = {
          ...squadData,
          members: members || []
        };
        
        setSquad(fullSquad);
        
        // Check if current user is a member or admin
        const userMembership = members?.find(m => m.student_id === session.user.id);
        setIsMember(!!userMembership);
        setIsAdmin(userMembership?.role === 'admin');
        
      } catch (error: any) {
        console.error("Error fetching squad details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load squad details"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSquadDetails();
  }, [squadId, navigate, toast]);
  
  const joinSquad = async () => {
    if (!squadId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Check if already a member
      if (isMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this squad"
        });
        return;
      }
      
      // Check if squad is at max capacity
      if (squad && squad.members.length >= squad.max_members) {
        toast({
          variant: "destructive",
          title: "Squad is full",
          description: "This squad has reached its maximum member capacity"
        });
        return;
      }
      
      // Join the squad
      const { error } = await supabase
        .from('peer_squad_members')
        .insert({
          peer_squad_id: squadId,
          student_id: session.user.id,
          role: 'member'
        });
        
      if (error) throw error;
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('first_name, last_name, profile_image_url')
        .eq('id', session.user.id)
        .single();
      
      // Update local state
      if (squad) {
        const newMember: SquadMember = {
          id: Math.random().toString(), // Temporary ID until page refresh
          student_id: session.user.id,
          role: 'member',
          joined_at: new Date().toISOString(),
          peer_squad_id: squadId,
          student: {
            first_name: profile?.first_name || 'User',
            last_name: profile?.last_name || '',
            profile_image_url: profile?.profile_image_url || null
          }
        };
        
        setSquad({
          ...squad,
          members: [...squad.members, newMember]
        });
        
        setIsMember(true);
      }
      
      toast({
        title: "Joined Successfully",
        description: "You have joined the peer squad"
      });
    } catch (error: any) {
      console.error("Error joining squad:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join the squad"
      });
    }
  };
  
  const leaveSquad = async () => {
    if (!squadId || !isMember) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Check if user is the only admin
      if (isAdmin && squad?.members.filter(m => m.role === 'admin').length === 1) {
        // Find another member to promote
        const otherMember = squad.members.find(m => m.role !== 'admin');
        
        if (!otherMember) {
          toast({
            variant: "destructive",
            title: "Cannot Leave Squad",
            description: "You are the only admin. Promote another member to admin first or delete the squad."
          });
          return;
        }
        
        // Promote another member to admin
        await supabase
          .from('peer_squad_members')
          .update({ role: 'admin' })
          .eq('id', otherMember.id);
          
        toast({
          title: "New Admin Assigned",
          description: `${otherMember.student.first_name} ${otherMember.student.last_name} has been promoted to admin.`
        });
      }
      
      // Leave the squad
      const { error } = await supabase
        .from('peer_squad_members')
        .delete()
        .eq('peer_squad_id', squadId)
        .eq('student_id', session.user.id);
        
      if (error) throw error;
      
      // Update local state
      if (squad) {
        setSquad({
          ...squad,
          members: squad.members.filter(m => m.student_id !== session.user.id)
        });
      }
      
      setIsMember(false);
      setIsAdmin(false);
      
      toast({
        title: "Left Squad",
        description: "You have left the peer squad"
      });
    } catch (error: any) {
      console.error("Error leaving squad:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to leave the squad"
      });
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Peer Squad Not Found</h2>
              <p className="text-gray-500 mb-4">The peer squad you're looking for doesn't exist or you don't have access to it.</p>
              <Button onClick={() => navigate('/peer-squad')}>View All Squads</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <Sidebar userRole="student" onLogout={handleLogout} />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <MobileHeader onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-start justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">{squad.name}</h1>
                <p className="text-gray-500 mt-1">{squad.description}</p>
                <div className="flex flex-wrap mt-2 gap-1.5">
                  {squad.skill_focus.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                {isMember ? (
                  <Button 
                    variant="outline" 
                    onClick={leaveSquad}
                  >
                    Leave Squad
                  </Button>
                ) : (
                  <Button 
                    onClick={joinSquad}
                    disabled={squad.members.length >= squad.max_members}
                  >
                    Join Squad
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Users className="mr-2 h-5 w-5 text-purple-500" />
                    Members
                  </CardTitle>
                  <CardDescription>
                    {squad.members.length} / {squad.max_members} members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {squad.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.student.profile_image_url || ''} alt={member.student.first_name} />
                          <AvatarFallback>{member.student.first_name.charAt(0)}{member.student.last_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {member.student.first_name} {member.student.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-3">
                <CardHeader>
                  <Tabs defaultValue="activities" className="w-full">
                    <TabsList>
                      <TabsTrigger value="activities" className="flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        Activities
                      </TabsTrigger>
                    </TabsList>
                  
                    <TabsContent value="activities" className="mt-4">
                      {isMember ? (
                        <SquadActivities 
                          squadId={squadId || ''} 
                          members={squad.members}
                          isAdmin={isAdmin}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-medium mb-2">Join to See Activities</h3>
                          <p className="text-gray-500 mb-4">Join the squad to view and participate in activities</p>
                          <Button 
                            onClick={joinSquad}
                            disabled={squad.members.length >= squad.max_members}
                          >
                            Join Squad
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PeerSquadDetail;
