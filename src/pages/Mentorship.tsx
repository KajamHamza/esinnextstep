
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
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Video, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type MentorBooking = {
  id: string;
  mentor_id: string;
  student_id: string;
  time_slot_id: string;
  status: string;
  booked_at: string;
  mentor: {
    id: string;
    name: string;
    role: string;
    avatar_url: string | null;
    specialty: string | null;
  };
  time_slot: {
    id: string;
    day: string;
    start_time: string;
    end_time: string;
  };
};

const MentorshipPage = () => {
  const [userRole, setUserRole] = useState<"student" | "employer">("student");
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<MentorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorBooking["mentor"] | null>(null);
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
          setProfile(profileData);
          setUserRole(profileData.role as "student" | "employer");
          
          if (profileData.role === "student") {
            await fetchBookings(session.user.id);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  const fetchBookings = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("mentor_bookings")
        .select(`
          *,
          mentor:mentor_id(id, name, role, avatar_url, specialty),
          time_slot:time_slot_id(id, day, start_time, end_time)
        `)
        .eq("student_id", userId)
        .order("booked_at", { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setBookings(data as MentorBooking[]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load mentorship bookings. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const startVideoCall = (booking: MentorBooking) => {
    // In a real application, this would integrate with a video call API
    toast({
      title: "Video call initiated",
      description: `Starting call with ${booking.mentor.name}`
    });
    
    // Here you would typically:
    // 1. Create a call session with your video provider (like Twilio, Agora, etc.)
    // 2. Generate tokens for participants
    // 3. Redirect to a call page or open a call modal
    
    // For demonstration, we could open a new window that would simulate a call
    window.open(`/video-call?booking=${booking.id}`, '_blank', 'width=800,height=600');
  };

  const startChat = (booking: MentorBooking) => {
    setSelectedMentor(booking.mentor);
    setOpenMessageDialog(true);
  };

  const sendMessage = () => {
    if (!messageText.trim() || !selectedMentor) return;
    
    toast({
      title: "Message sent",
      description: `Your message was sent to ${selectedMentor.name}`
    });
    
    // In a real app, you would save this message to your database
    console.log("Message to", selectedMentor.name, ":", messageText);
    
    // Reset form
    setMessageText("");
    setOpenMessageDialog(false);
  };

  const isUpcoming = (booking: MentorBooking) => {
    // Get date from booking.time_slot.day (format: "Monday", "Tuesday", etc.)
    // For simplicity, we'll consider all bookings as upcoming in this example
    return booking.status === 'confirmed';
  };
  
  const isPast = (booking: MentorBooking) => {
    // In a real application, you would check if the booking date is in the past
    return booking.status === 'completed';
  };

  const getUpcomingBookings = () => {
    return bookings.filter(booking => isUpcoming(booking));
  };
  
  const getPastBookings = () => {
    return bookings.filter(booking => isPast(booking));
  };

  const goToMentorSearch = () => {
    // Navigate to a dedicated mentor search page, not the learning paths page
    navigate('/mentorship/find');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      
      <div className="flex-1 md:ml-64"> {/* Add left margin to prevent content overlap with sidebar */}
        <MobileHeader onLogout={handleLogout} userRole={userRole} />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Mentorship</h1>
              
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Button onClick={goToMentorSearch}>
                  Find a Mentor
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6">
              <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
                  <TabsTrigger value="past">Past Sessions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Mentorship Sessions</CardTitle>
                      <CardDescription>
                        Your scheduled mentorship sessions. Join via video call when it's time.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center py-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getUpcomingBookings().length > 0 ? (
                            getUpcomingBookings().map(booking => (
                              <MentorshipBookingCard 
                                key={booking.id}
                                booking={booking}
                                onVideoCall={() => startVideoCall(booking)}
                                onChat={() => startChat(booking)}
                                isUpcoming={true}
                              />
                            ))
                          ) : (
                            <div className="text-center py-10 text-muted-foreground">
                              <p>You don't have any upcoming mentorship sessions.</p>
                              <Button 
                                variant="outline" 
                                className="mt-4"
                                onClick={goToMentorSearch}
                              >
                                Find a Mentor
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="past">
                  <Card>
                    <CardHeader>
                      <CardTitle>Past Mentorship Sessions</CardTitle>
                      <CardDescription>
                        Your completed mentorship sessions. Review and book follow-ups if needed.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center py-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getPastBookings().length > 0 ? (
                            getPastBookings().map(booking => (
                              <MentorshipBookingCard 
                                key={booking.id}
                                booking={booking}
                                onVideoCall={() => {}}
                                onChat={() => startChat(booking)}
                                isUpcoming={false}
                              />
                            ))
                          ) : (
                            <div className="text-center py-10 text-muted-foreground">
                              <p>You don't have any past mentorship sessions.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Message Dialog */}
      <Dialog open={openMessageDialog} onOpenChange={setOpenMessageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Message to {selectedMentor?.name}</DialogTitle>
            <DialogDescription>
              Send a message to your mentor. They will respond to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Type your message here..."
              className="min-h-[100px]"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenMessageDialog(false)}>Cancel</Button>
            <Button onClick={sendMessage}>Send Message</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MentorshipBookingCardProps {
  booking: MentorBooking;
  onVideoCall: () => void;
  onChat: () => void;
  isUpcoming: boolean;
}

const MentorshipBookingCard = ({ booking, onVideoCall, onChat, isUpcoming }: MentorshipBookingCardProps) => {
  const formattedDate = new Date(booking.booked_at).toLocaleDateString();
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarImage src={booking.mentor.avatar_url || ''} alt={booking.mentor.name} />
          <AvatarFallback>{booking.mentor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">{booking.mentor.name}</h3>
              <p className="text-sm text-muted-foreground">{booking.mentor.role}</p>
            </div>
            
            <Badge variant={isUpcoming ? "default" : "outline"}>
              {isUpcoming ? "Upcoming" : "Completed"}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-sm">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{booking.time_slot.day}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{booking.time_slot.start_time} - {booking.time_slot.end_time}</span>
            </div>
          </div>
          
          {booking.mentor.specialty && (
            <div className="text-sm">
              <span className="font-medium">Specialty:</span> {booking.mentor.specialty}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {isUpcoming && (
            <Button 
              onClick={onVideoCall} 
              className="flex items-center"
              variant="default"
            >
              <Video className="mr-2 h-4 w-4" />
              Join Call
            </Button>
          )}
          
          <Button 
            onClick={onChat} 
            variant="outline"
            className="flex items-center"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MentorshipPage;
