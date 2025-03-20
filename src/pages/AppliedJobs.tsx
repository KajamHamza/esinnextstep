import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Briefcase, 
  Building, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  MapPin, 
  MessageSquare, 
  ThumbsDown, 
  XCircle 
} from "lucide-react";
import { JobApplication } from "@/types/database";

const AppliedJobs = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'student' | 'employer'>('student');

  useEffect(() => {
    fetchUserRole();
    fetchApplications();
  }, []);

  const fetchUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setUserRole(data.role as 'student' | 'employer');
      }
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to view your applications"
        });
        return;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs:job_id (title, company, location, job_type)
        `)
        .eq('student_id', session.user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data as JobApplication[]);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your job applications"
      });
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: 'withdrawn' })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: 'withdrawn' } : app
        )
      );

      toast({
        title: "Application Withdrawn",
        description: "Your job application has been withdrawn"
      });
    } catch (error: any) {
      console.error("Error withdrawing application:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to withdraw your application"
      });
    }
  };

  const sendRecruiterMessage = async (jobId: string) => {
    try {
      if (!message.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a message to send"
        });
        return;
      }

      setSendingMessage(true);
      
      // In a real application, this would send a message to the employer
      // For now, we'll just show a success message
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the recruiter"
      });

      setMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send your message"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Clock className="w-3 h-3 mr-1" /> Applied</Badge>;
      case 'in_review':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200"><FileText className="w-3 h-3 mr-1" /> In Review</Badge>;
      case 'interview':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><Calendar className="w-3 h-3 mr-1" /> Interview</Badge>;
      case 'offer':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200"><CheckCircle className="w-3 h-3 mr-1" /> Offer</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><ThumbsDown className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200"><XCircle className="w-3 h-3 mr-1" /> Withdrawn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredApplications = filter === "all" 
    ? applications 
    : applications.filter(app => app.status === filter);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      <div className="flex-1 md:ml-64">
        <MobileHeader onLogout={handleLogout} />
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Applied Jobs</h1>
              <p className="text-gray-600 dark:text-gray-400">Track the status of your job applications</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "applied" ? "default" : "outline"}
                onClick={() => setFilter("applied")}
                size="sm"
              >
                Applied
              </Button>
              <Button
                variant={filter === "in_review" ? "default" : "outline"}
                onClick={() => setFilter("in_review")}
                size="sm"
              >
                In Review
              </Button>
              <Button
                variant={filter === "interview" ? "default" : "outline"}
                onClick={() => setFilter("interview")}
                size="sm"
              >
                Interview
              </Button>
              <Button
                variant={filter === "offer" ? "default" : "outline"}
                onClick={() => setFilter("offer")}
                size="sm"
              >
                Offer
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="border-dashed bg-white dark:bg-gray-800">
              <CardContent className="py-10 flex flex-col items-center">
                <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No applications found</h2>
                <p className="text-gray-500 text-center mb-4">
                  {filter === "all" 
                    ? "You haven't applied to any jobs yet. Start exploring opportunities!" 
                    : `You don't have any applications with '${filter}' status.`}
                </p>
                <Button onClick={() => window.location.href = "/jobs"}>
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="bg-white dark:bg-gray-800 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{application.jobs?.title}</CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building className="w-4 h-4 mr-2" />
                        {application.jobs?.company}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        {application.jobs?.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {application.jobs?.job_type}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Applied on {formatDate(application.applied_at)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Message Recruiter</DialogTitle>
                            <DialogDescription>
                              Send a message to the recruiter about your application for {application.jobs?.title} at {application.jobs?.company}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Textarea
                              placeholder="Type your message here..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="min-h-[150px]"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => sendRecruiterMessage(application.job_id)}
                              disabled={sendingMessage || !message.trim()}
                            >
                              {sendingMessage ? "Sending..." : "Send Message"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {application.status !== 'withdrawn' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => withdrawApplication(application.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppliedJobs;
