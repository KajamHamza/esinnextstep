import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Users, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PeerSquad } from "@/types/database";
import { peerSquadService } from '@/services/peerSquadService';

const PeerSquadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [allSquads, setAllSquads] = useState<PeerSquad[]>([]);
  const [mySquads, setMySquads] = useState<PeerSquad[]>([]);
  const [filteredSquads, setFilteredSquads] = useState<PeerSquad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSquad, setNewSquad] = useState({
    name: '',
    description: '',
    skill_focus: [] as string[],
    max_members: 5
  });
  const [skillInput, setSkillInput] = useState('');
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(data);
        
        loadPeerSquads();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Please log in again",
        });
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const loadPeerSquads = async () => {
    setLoading(true);
    try {
      const [allSquadsData, mySquadsData] = await Promise.all([
        peerSquadService.getSquads(),
        peerSquadService.getUserPeerSquads()
      ]);
      
      setAllSquads(allSquadsData);
      setFilteredSquads(allSquadsData);
      setMySquads(mySquadsData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading peer squads",
        description: error.message || "Failed to load peer squads",
      });
    } finally {
      setLoading(false);
    }
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredSquads(allSquads);
      return;
    }
    
    const filtered = allSquads.filter(squad => 
      squad.name.toLowerCase().includes(query) || 
      (squad.description && squad.description.toLowerCase().includes(query)) ||
      squad.skill_focus.some(skill => skill.toLowerCase().includes(query))
    );
    
    setFilteredSquads(filtered);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !newSquad.skill_focus.includes(skillInput.trim())) {
      setNewSquad({
        ...newSquad,
        skill_focus: [...newSquad.skill_focus, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setNewSquad({
      ...newSquad,
      skill_focus: newSquad.skill_focus.filter(skill => skill !== skillToRemove)
    });
  };

  const handleCreateSquad = async () => {
    if (!newSquad.name.trim() || newSquad.skill_focus.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a name and at least one skill focus",
      });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const squadToCreate = {
        ...newSquad,
        created_by: session.user.id
      };
      
      const createdSquad = await peerSquadService.createSquad(squadToCreate);
      
      if (!createdSquad) {
        throw new Error("Failed to create peer squad");
      }
      
      toast({
        title: "Success",
        description: "Peer squad created successfully",
      });
      
      setCreateDialogOpen(false);
      setNewSquad({
        name: '',
        description: '',
        skill_focus: [],
        max_members: 5
      });
      
      loadPeerSquads();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating peer squad",
        description: error.message || "Failed to create peer squad",
      });
    }
  };

  const handleViewDetails = (squadId: string) => {
    navigate(`/peer-squad/${squadId}`);
  };

  const renderSquadCard = (squad: PeerSquad) => (
    <Card key={squad.id} className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{squad.name}</CardTitle>
        <CardDescription>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{squad.members.length} / {squad.max_members} members</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {squad.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {squad.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {squad.skill_focus.slice(0, 3).map(skill => (
            <Badge key={skill} variant="secondary">{skill}</Badge>
          ))}
          {squad.skill_focus.length > 3 && (
            <Badge variant="outline">+{squad.skill_focus.length - 3} more</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => handleViewDetails(squad.id)} 
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSkeletons = () => (
    Array(6).fill(0).map((_, i) => (
      <Card key={i} className="h-full flex flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="flex-grow">
          <Skeleton className="h-12 w-full mb-4" />
          <div className="flex gap-1 mt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <Sidebar 
        userRole={profile?.role || 'student'} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <MobileHeader onLogout={handleLogout} />
        
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Peer Squad</h1>
                <p className="text-muted-foreground">
                  Connect with peers to practice coding, prepare for interviews, and build projects together
                </p>
              </div>
              
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 md:mt-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Squad
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Create New Peer Squad</DialogTitle>
                    <DialogDescription>
                      Form a squad with peers who share similar learning goals and skills
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Squad Name</Label>
                      <Input
                        id="name"
                        value={newSquad.name}
                        onChange={(e) => setNewSquad({...newSquad, name: e.target.value})}
                        placeholder="Enter a name for your squad"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newSquad.description || ''}
                        onChange={(e) => setNewSquad({...newSquad, description: e.target.value})}
                        placeholder="What will your squad focus on?"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Skill Focus</Label>
                      <div className="flex gap-2">
                        <Input
                          id="skills"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Add skills (e.g., JavaScript)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddSkill} size="sm">
                          Add
                        </Button>
                      </div>
                      
                      {newSquad.skill_focus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {newSquad.skill_focus.map(skill => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleRemoveSkill(skill)}
                            >
                              {skill} &times;
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="max_members">Maximum Members</Label>
                      <Input
                        id="max_members"
                        type="number"
                        min={2}
                        max={10}
                        value={newSquad.max_members}
                        onChange={(e) => setNewSquad({...newSquad, max_members: parseInt(e.target.value) || 5})}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSquad}>
                      Create Squad
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search peer squads by name, description or skills"
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="all">All Squads</TabsTrigger>
                <TabsTrigger value="my">My Squads</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="animate-fade-in">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderSkeletons()}
                  </div>
                ) : filteredSquads.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No peer squads found</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery ? 'Try a different search term' : 'Be the first to create a peer squad!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSquads.map(renderSquadCard)}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="my" className="animate-fade-in">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderSkeletons()}
                  </div>
                ) : mySquads.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">You haven't joined any peer squads yet</h3>
                    <p className="text-muted-foreground mt-1">
                      Join an existing squad or create your own to get started
                    </p>
                    <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Squad
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mySquads.map(renderSquadCard)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PeerSquadPage;
