
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Briefcase,
  Award,
  Users,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  CheckCircle,
  Video
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: 'student' | 'employer';
  onLogout: () => void;
}

export const Sidebar = ({ userRole, onLogout }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the current route matches the path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Save preference to localStorage
    localStorage.setItem('sidebarCollapsed', String(!collapsed));
  };

  // Load user preference on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  return (
      <aside className={cn(
          "hidden md:flex flex-col bg-white dark:bg-slate-950 border-r fixed h-screen z-10 transition-all duration-300 ease-in-out top-0 left-0",
          collapsed ? "w-20" : "w-64"
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <GraduationCap className="h-6 w-6 text-purple-600 flex-shrink-0" />
            {!collapsed && <h1 className="text-xl font-bold">EsinNextStep</h1>}
          </div>
          <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <div className="p-2 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            <Button
                variant={isActive('/dashboard') ? "secondary" : "ghost"}
                className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                onClick={() => navigate('/dashboard')}
            >
              <TrendingUp className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>Dashboard</span>}
            </Button>

            {userRole === 'student' && (
                <>
                  <Button
                      variant={isActive('/jobs') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/jobs')}
                  >
                    <Briefcase className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Jobs</span>}
                  </Button>

                  <Button
                      variant={isActive('/applied-jobs') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/applied-jobs')}
                  >
                    <CheckCircle className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Applied Jobs</span>}
                  </Button>

                  <Button
                      variant={isActive('/learning') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/learning')}
                  >
                    <BookOpen className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Learning Paths</span>}
                  </Button>

                  <Button
                      variant={isActive('/mentorship') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/mentorship')}
                  >
                    <Video className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Mentorship</span>}
                  </Button>

                  <Button
                      variant={isActive('/resume-builder') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/resume-builder')}
                  >
                    <FileText className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Resume Builder</span>}
                  </Button>

                  <Button
                      variant={isActive('/achievements') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/achievements')}
                  >
                    <Award className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Achievements</span>}
                  </Button>

                  <Button
                      variant={isActive('/peer-squad') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/peer-squad')}
                  >
                    <Users className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Peer Squad</span>}
                  </Button>
                </>
            )}

            {userRole === 'employer' && (
                <>
                  <Button
                      variant={isActive('/job-postings') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/job-postings')}
                  >
                    <Briefcase className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Job Postings</span>}
                  </Button>
                  <Button
                      variant={isActive('/candidates') ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                      onClick={() => navigate('/candidates')}
                  >
                    <Users className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>Candidates</span>}
                  </Button>
                </>
            )}

            <Button
                variant={isActive('/profile') ? "secondary" : "ghost"}
                className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                onClick={() => navigate('/profile')}
            >
              <User className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>Profile</span>}
            </Button>

            <Button
                variant={isActive('/settings') ? "secondary" : "ghost"}
                className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                onClick={() => navigate('/settings')}
            >
              <Settings className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>Settings</span>}
            </Button>
          </nav>
        </div>

        <div className="p-4 border-t">
          <Button
              variant="ghost"
              className={cn("w-full justify-start", collapsed && "justify-center px-2")}
              onClick={onLogout}
          >
            <LogOut className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </aside>
  );
};