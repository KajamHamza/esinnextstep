
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UpgradeModal } from "./UpgradeModal";

type Mentor = {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  availability: string;
  premium_only: boolean;
  slots: MentorTimeSlot[];
};

type MentorTimeSlot = {
  id: string;
  mentor_id: string;
  day: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked';
};

type BookingDetails = {
  mentor: Mentor | null;
  slot: MentorTimeSlot | null;
};

export const MentorshipCard = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    mentor: null,
    slot: null
  });
  const [accountType, setAccountType] = useState<'free' | 'premium'>('free');
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch user's account type
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setAccountType(profile.account_type as 'free' | 'premium');
        }

        // Fetch mentors
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('mentors')
          .select('id, name, role, avatar_url, availability_status, premium_only');
          
        if (mentorsError) throw mentorsError;
        
        // Fetch mentor time slots
        const { data: slotsData, error: slotsError } = await supabase
          .from('mentor_time_slots')
          .select('*')
          .in('status', ['available', 'booked']);
          
        if (slotsError) throw slotsError;
        
        // Group slots by mentor
        const slotsByMentor: Record<string, MentorTimeSlot[]> = {};
        slotsData?.forEach(slot => {
          if (!slotsByMentor[slot.mentor_id]) {
            slotsByMentor[slot.mentor_id] = [];
          }
          slotsByMentor[slot.mentor_id].push({
            id: slot.id,
            mentor_id: slot.mentor_id,
            day: slot.day,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: slot.status as 'available' | 'booked'
          });
        });
        
        // Build mentor objects with availability
        const processedMentors = mentorsData?.map(mentor => {
          const mentorSlots = slotsByMentor[mentor.id] || [];
          const availableSlots = mentorSlots.filter(slot => slot.status === 'available');
          
          let availability = "No availability";
          if (availableSlots.length > 0) {
            availability = availableSlots.length > 3 
              ? "High availability" 
              : availableSlots.length > 1 
                ? "Limited availability" 
                : "Low availability";
          }
          
          return {
            id: mentor.id,
            name: mentor.name,
            role: mentor.role,
            avatar: mentor.avatar_url,
            availability,
            premium_only: mentor.premium_only,
            slots: mentorSlots
          };
        }) || [];
        
        setMentors(processedMentors);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, []);
  
  const handleOpenBooking = (mentor: Mentor) => {
    // Check if premium mentor and user is on free plan
    if (mentor.premium_only && accountType === 'free') {
      toast({
        variant: "destructive",
        title: "Premium feature",
        description: "This mentor is only available for premium users. Please upgrade your account."
      });
      return;
    }
    
    setBookingDetails({
      mentor,
      slot: null
    });
    setBookingOpen(true);
  };
  
  const handleCloseBooking = () => {
    setBookingOpen(false);
    setBookingDetails({
      mentor: null,
      slot: null
    });
  };
  
  const handleSelectTimeSlot = (slot: MentorTimeSlot) => {
    setBookingDetails(prev => ({
      ...prev,
      slot
    }));
  };
  
  const handleBookSession = async () => {
    try {
      setConfirming(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to book a mentorship session"
        });
        return;
      }
      
      if (!bookingDetails.mentor || !bookingDetails.slot) {
        toast({
          variant: "destructive",
          title: "Booking error",
          description: "Please select a mentor and time slot"
        });
        return;
      }
      
      // Book the session
      const { error } = await supabase
        .from('mentor_bookings')
        .insert({
          student_id: session.user.id,
          mentor_id: bookingDetails.mentor.id,
          time_slot_id: bookingDetails.slot.id,
          status: 'confirmed',
          booked_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Update the time slot status
      await supabase
        .from('mentor_time_slots')
        .update({ status: 'booked' })
        .eq('id', bookingDetails.slot.id);
      
      // Update local state
      setMentors(prev => prev.map(mentor => {
        if (mentor.id === bookingDetails.mentor?.id) {
          return {
            ...mentor,
            slots: mentor.slots.map(slot => 
              slot.id === bookingDetails.slot?.id 
                ? { ...slot, status: 'booked' } 
                : slot
            )
          };
        }
        return mentor;
      }));
      
      // Close dialog and show success message
      handleCloseBooking();
      toast({
        title: "Session booked",
        description: `You have successfully booked a session with ${bookingDetails.mentor.name}`
      });
      
      // Award XP for booking a mentorship session
      await supabase.rpc('award_xp', { 
        user_id: session.user.id, 
        xp_amount: 25
      });
      
    } catch (error: any) {
      console.error("Error booking session:", error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message || "Failed to book mentorship session"
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg font-medium">
            <Users className="mr-2 h-5 w-5 text-green-500" />
            Mentorship
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Connect with industry mentors for guidance and advice</p>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {mentors.map(mentor => (
                <div key={mentor.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={mentor.avatar || ''} alt={mentor.name} />
                      <AvatarFallback>{mentor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium">{mentor.name}</h4>
                      <p className="text-xs text-muted-foreground">{mentor.role}</p>
                      <p className="text-xs text-green-600">{mentor.availability}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpenBooking(mentor)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-3 mt-4 border border-purple-100 dark:border-purple-800">
            <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">Premium Mentorship</h4>
            <p className="text-xs text-muted-foreground mt-1">Upgrade to premium for unlimited mentorship access and priority booking.</p>
            <UpgradeModal
              trigger={
                <Button 
                  size="sm" 
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                >
                  Upgrade Now
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Mentorship Session</DialogTitle>
            <DialogDescription>
              Select an available time slot to book with {bookingDetails.mentor?.name}.
            </DialogDescription>
          </DialogHeader>
          
          {bookingDetails.mentor && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={bookingDetails.mentor.avatar || ''} alt={bookingDetails.mentor.name} />
                  <AvatarFallback>{bookingDetails.mentor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{bookingDetails.mentor.name}</h3>
                  <p className="text-sm text-muted-foreground">{bookingDetails.mentor.role}</p>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-2">Available Time Slots:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bookingDetails.mentor.slots.filter(slot => slot.status === 'available').length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No available time slots.</p>
                ) : (
                  bookingDetails.mentor.slots
                    .filter(slot => slot.status === 'available')
                    .map(slot => (
                      <div 
                        key={slot.id} 
                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
                          bookingDetails.slot?.id === slot.id 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => handleSelectTimeSlot(slot)}
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{slot.day}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{slot.start_time} - {slot.end_time}</span>
                        </div>
                        {bookingDetails.slot?.id === slot.id && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseBooking}>Cancel</Button>
            <Button 
              onClick={handleBookSession} 
              disabled={!bookingDetails.slot || confirming}
              className="ml-2"
            >
              {confirming ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Confirming...
                </>
              ) : "Book Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
