
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { jobService, type Job } from "@/services/jobService";
import { BriefcaseBusiness, Building, Calendar, CheckCircle, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState<string>("");
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const allJobs = await jobService.getAllJobs();
        setJobs(allJobs);
        setFilteredJobs(allJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load jobs",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  useEffect(() => {
    // Filter jobs based on search term and job type
    const filtered = jobs.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills_required.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesJobType = !jobType || job.job_type === jobType;

      return matchesSearch && matchesJobType;
    });

    setFilteredJobs(filtered);
  }, [searchTerm, jobType, jobs]);

  const handleLogout = async () => {
    // Handle logout
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        <Sidebar userRole="student" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          <MobileHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
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
          <div className="container">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Browse Jobs</h1>
                <p className="text-muted-foreground mt-1">Find your next career opportunity</p>
              </div>
            </div>

            {/* Search and filters */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs, companies, or skills..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Job Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => { 
                      setSearchTerm(""); 
                      setJobType(""); 
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job listings */}
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BriefcaseBusiness className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Jobs Found</h2>
                  <p className="text-muted-foreground mb-6">
                    No jobs match your current filters. Try adjusting your search criteria.
                  </p>
                  <Button onClick={() => { setSearchTerm(""); setJobType(""); }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
                </p>
                
                {filteredJobs.map((job) => (
                  <Card 
                    key={job.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <h3 className="text-xl font-semibold">{job.title}</h3>
                            <Badge className="ml-2" variant="outline">
                              {job.job_type}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {job.company}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Posted {format(new Date(job.posted_at), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:text-right">
                          {job.salary_range && (
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {job.salary_range}
                            </p>
                          )}
                          <Button size="sm" className="mt-2">
                            View Job
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <p className="line-clamp-2 text-sm text-muted-foreground mb-3">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.skills_required.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          
                          {job.skills_required.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills_required.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Jobs;
