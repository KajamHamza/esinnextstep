
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Mentor = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  avatar_url: string | null;
  rating: number;
  available_slots: number;
};

const MentorSearch = () => {
  const [userRole, setUserRole] = useState<"student" | "employer">("student");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sample mentor data - in a real app, this would come from your database
  const sampleMentors: Mentor[] = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Senior Software Engineer",
      specialty: "React, Node.js",
      bio: "10+ years helping junior developers grow their skills in full-stack development",
      avatar_url: null,
      rating: 4.8,
      available_slots: 3,
    },
    {
      id: "2",
      name: "Sarah Chen",
      role: "UX Designer",
      specialty: "UI/UX, Product Design",
      bio: "Design lead with experience mentoring at top tech companies",
      avatar_url: null,
      rating: 4.9,
      available_slots: 2,
    },
    {
      id: "3",
      name: "Michael Rodriguez",
      role: "Engineering Manager",
      specialty: "Career Development, Leadership",
      bio: "Helping engineers navigate career transitions and growth opportunities",
      avatar_url: null,
      rating: 4.7,
      available_slots: 5,
    },
    {
      id: "4",
      name: "Priya Patel",
      role: "Data Scientist",
      specialty: "Machine Learning, Python",
      bio: "Ph.D. in Computer Science specializing in ML algorithms and implementations",
      avatar_url: null,
      rating: 4.9,
      available_slots: 1,
    },
  ];

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          setUserRole(profileData.role as "student" | "employer");
        }
        
        // In a real app, you would fetch mentors from your database
        setMentors(sampleMentors);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const bookMentor = (mentor: Mentor) => {
    toast({
      title: "Booking requested",
      description: `Your request to book a session with ${mentor.name} has been sent.`,
    });
    
    // In a real application, you would:
    // 1. Create a booking record in your database
    // 2. Notify the mentor
    // 3. Add the booking to the user's upcoming sessions
    
    // Navigate back to the mentorship page to see pending bookings
    setTimeout(() => navigate("/mentorship"), 1500);
  };

  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      
      <div className="flex-1 md:ml-64"> {/* Add left margin to prevent content overlap with sidebar */}
        <MobileHeader onLogout={handleLogout} userRole={userRole} />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Find a Mentor</h1>
                <p className="text-muted-foreground">
                  Connect with industry experts to accelerate your career growth
                </p>
              </div>
              
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, specialty or role..." 
                  className="pl-9 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredMentors.length > 0 ? (
                  filteredMentors.map(mentor => (
                    <MentorCard 
                      key={mentor.id} 
                      mentor={mentor} 
                      onBook={() => bookMentor(mentor)} 
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10">
                    <p className="text-muted-foreground">No mentors found matching your search criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

interface MentorCardProps {
  mentor: Mentor;
  onBook: () => void;
}

const MentorCard = ({ mentor, onBook }: MentorCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-primary/10">
              <AvatarImage src={mentor.avatar_url || ''} alt={mentor.name} />
              <AvatarFallback>{mentor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{mentor.name}</CardTitle>
              <CardDescription>{mentor.role}</CardDescription>
            </div>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium ml-1">{mentor.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">Specialty:</span>
            <span className="text-sm ml-1">{mentor.specialty}</span>
          </div>
          <p className="text-sm text-muted-foreground">{mentor.bio}</p>
          <div className="pt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              {mentor.available_slots} available slots this week
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onBook} className="w-full">Book a Session</Button>
      </CardFooter>
    </Card>
  );
};

export default MentorSearch;
