
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import StudentOnboarding from "./pages/onboarding/StudentOnboarding";
import EmployerOnboarding from "./pages/onboarding/EmployerOnboarding";
import ResumeBuilder from "./pages/ResumeBuilder";
import JobDetails from "./pages/JobDetails";
import Jobs from "./pages/Jobs";
import AppliedJobs from "./pages/AppliedJobs";
import Achievements from "./pages/Achievements";
import AchievementDetails from "./pages/AchievementDetails";
import PeerSquad from "./pages/PeerSquad";
import PeerSquadDetail from "./pages/PeerSquadDetail";
import StudentProfile from "./pages/StudentProfile";
import Settings from "./pages/Settings";
import LearningPaths from "./pages/LearningPaths";
import LearningPathDetails from "./pages/LearningPathDetails";
import Mentorship from "./pages/Mentorship";
import MentorSearch from "./pages/MentorSearch";
import RootComponent from "@/components/RootComponent.tsx";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RootComponent>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding/student" element={<StudentOnboarding />} />
            <Route path="/onboarding/employer" element={<EmployerOnboarding />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/applied-jobs" element={<AppliedJobs />} />
            <Route path="/learning" element={<LearningPaths />} />
            <Route path="/learning/:pathId" element={<LearningPathDetails />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/mentorship/find" element={<MentorSearch />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/achievements/:achievementId" element={<AchievementDetails />} />
            <Route path="/peer-squad" element={<PeerSquad />} />
            <Route path="/peer-squad/:squadId" element={<PeerSquadDetail />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/profile/:userId" element={<StudentProfile />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </RootComponent>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;