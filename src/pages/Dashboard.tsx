/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import refactored components
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { StudentDashboard } from '@/components/dashboard/student/StudentDashboard';
import { EmployerDashboard } from '@/components/dashboard/employer/EmployerDashboard';

// Define a type for the user profile
type Profile = {
  id: string;
  role: 'student' | 'employer';
  account_type: 'free' | 'premium';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        // Fetch profile data
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No profile found, redirect to auth page
            toast({
              variant: "destructive",
              title: "Profile not found",
              description: "Please log in again",
            });
            navigate('/auth');
            return;
          }
          throw profileError;
        }
        
        setProfile(data as Profile);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Please log in again",
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar 
        userRole={profile?.role || 'student'} 
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <MobileHeader onLogout={handleLogout} />
        
        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Welcome to Your Dashboard</h1>
            
            {profile?.role === 'student' && (
              <StudentDashboard account_type={profile.account_type} />
            )}
            
            {profile?.role === 'employer' && (
              <EmployerDashboard account_type={profile.account_type} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
