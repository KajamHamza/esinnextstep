
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Briefcase, Award, Users, CheckCircle } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('students');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navbar */}
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold">EsinNextStep</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/auth?signup=true">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Launch Your Career <span className="text-purple-600">Without Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Connect with opportunities that value your potential over your past
          </p>
          
          <Tabs defaultValue="students" className="max-w-lg mx-auto" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="students">For Job Seekers</TabsTrigger>
              <TabsTrigger value="employers">For Employers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="mt-0">
              <Link to="/auth?role=student&signup=true">
                <Button size="lg" className="w-full md:w-auto px-8 bg-purple-600 hover:bg-purple-700">
                  Find Your First Job
                </Button>
              </Link>
            </TabsContent>
            
            <TabsContent value="employers" className="mt-0">
              <Link to="/auth?role=employer&signup=true">
                <Button size="lg" className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700">
                  Post Jobs & Internships
                </Button>
              </Link>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {activeTab === 'students' ? (
              <>
                <Card>
                  <CardHeader>
                    <Award className="h-10 w-10 text-purple-600 mb-2" />
                    <CardTitle>Turn Projects Into Experience</CardTitle>
                    <CardDescription>
                      Our AI helps you showcase academic work as professional experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>AI-powered resume builder tailored for entry-level positions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Highlight skills from coursework and projects</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Users className="h-10 w-10 text-purple-600 mb-2" />
                    <CardTitle>Your Squad Has Your Back</CardTitle>
                    <CardDescription>
                      Connect with peers in similar career paths for support
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Get resume feedback from peers and mentors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Celebrate milestones and gain XP points</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <Award className="h-10 w-10 text-blue-600 mb-2" />
                    <CardTitle>Skip The Noise</CardTitle>
                    <CardDescription>
                      Connect directly with motivated entry-level talent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Pre-vetted candidates ready for their first role</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Filter by university, skills, or project experience</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Briefcase className="h-10 w-10 text-blue-600 mb-2" />
                    <CardTitle>Hire Faster</CardTitle>
                    <CardDescription>
                      Tools to manage internships and entry-level hiring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Post jobs with transparent salary ranges</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>One-click messaging and interview scheduling</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Pricing</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Affordable plans for students and employers
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-purple-200 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>For Job Seekers</span>
                </CardTitle>
                <CardDescription>Access to jobs and basic features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    Free <span className="text-sm font-normal text-gray-500">/ Basic</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Or $8/month for Premium</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Apply to jobs and internships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AI Resume Builder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Basic peer support</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-500">
                    <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Unlimited mentorship (Premium)</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-500">
                    <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Resume priority review (Premium)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/auth?role=student&signup=true" className="w-full">
                  <Button variant="outline" className="w-full">Get Started Free</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>For Employers</span>
                </CardTitle>
                <CardDescription>Post jobs and find talent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    $99 <span className="text-sm font-normal text-gray-500">/ month</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Starter plan</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>3 active job postings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Basic candidate filtering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Messaging with applicants</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-500">
                    <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>10 job postings (Pro - $299/month)</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-500">
                    <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Analytics dashboard (Pro)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/auth?role=employer&signup=true" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Hiring</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-bold">EsinNextStep</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} EsinNextStep. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
