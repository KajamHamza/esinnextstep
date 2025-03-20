import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { jobService, type Job } from "@/services/jobService";
import { BriefcaseBusiness, Building, Calendar, CheckCircle, Clock, GraduationCap, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { resumeService } from "@/services/resumeService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [hasApplied, setHasApplied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch resumes for application
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeService.getAllResumes,
    enabled: isApplicationDialogOpen,
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
        
        // Check if user has already applied to this job
        const applicationStatus = await jobService.checkApplicationStatus(jobId);
        setHasApplied(applicationStatus.applied);
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load job details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, toast]);

  const handleLogout = async () => {
    navigate('/');
  };

  const handleApply = async () => {
    if (!job) return;
    
    setIsApplicationDialogOpen(true);
  };

  const submitApplication = async () => {
    if (!job?.id) return;
    
    setApplying(true);
    try {
      const success = await jobService.applyToJob(
        job.id, 
        selectedResumeId, 
        coverLetter
      );
      
      if (success) {
        setHasApplied(true);
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully!",
        });
        setIsApplicationDialogOpen(false);
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply to this job. Please try again.",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <div className="container max-w-4xl">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <div className="container max-w-4xl">
              <Card>
                <CardContent className="pt-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                  <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist or has been removed.</p>
                  <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
                </CardContent>
              </Card>
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
          <div className="container max-w-4xl">
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={() => navigate('/jobs')}
            >
              ← Back to Jobs
            </Button>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <Building className="h-4 w-4" /> {job.company}
                      <span className="mx-1">•</span>
                      <MapPin className="h-4 w-4" /> {job.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {job.job_type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Job overview section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {job.salary_range && (
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <BriefcaseBusiness className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Salary Range</p>
                        <p className="font-medium">{job.salary_range}</p>
                      </div>
                    </div>
                  )}
                  
                  {job.experience_level && (
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-medium">{job.experience_level}</p>
                      </div>
                    </div>
                  )}
                  
                  {job.education_level && (
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Education</p>
                        <p className="font-medium">{job.education_level}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Posted On</p>
                      <p className="font-medium">{format(new Date(job.posted_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Job description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
                
                {/* Skills required */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Responsibilities */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  Apply before {job.expires_at ? format(new Date(job.expires_at), 'MMM dd, yyyy') : 'position is filled'}
                </div>
                {hasApplied ? (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-green-600 border-green-600"
                    disabled
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Applied
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleApply}
                    disabled={applying}
                  >
                    {applying ? "Applying..." : "Apply Now"}
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Application Dialog */}
            <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Apply for {job?.title}</DialogTitle>
                  <DialogDescription>
                    Submit your application for this position at {job?.company}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Select Resume</h4>
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes && resumes.length > 0 ? (
                          resumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id || ""}>{resume.title}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-resume" disabled>No resumes available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {resumes && resumes.length === 0 && (
                      <p className="text-xs text-amber-500">
                        You haven't created any resumes yet. 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xs"
                          onClick={() => {
                            setIsApplicationDialogOpen(false);
                            navigate('/resume-builder');
                          }}
                        >
                          Create one now
                        </Button>
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Cover Letter (Optional)</h4>
                    <Textarea
                      placeholder="Tell the employer why you're a great fit for this position..."
                      className="min-h-[150px]"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApplicationDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={submitApplication} 
                    disabled={!selectedResumeId || selectedResumeId === "no-resume" || applying}
                  >
                    {applying ? "Submitting..." : "Submit Application"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobDetails;
