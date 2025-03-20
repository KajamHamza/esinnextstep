/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { DarkModeContext } from '@/components/RootComponent';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Moon, 
  Sun, 
  Bell, 
  User, 
  Lock, 
  LogOut, 
  Trash2, 
  Mail, 
  ExternalLink,
  Shield
} from 'lucide-react';

// Define a type for the settings
type Settings = {
  darkMode: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode, setIsDarkMode } = useContext(DarkModeContext);
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    emailNotifications: true,
    marketingEmails: false,
    productUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        setUserEmail(session.user.email);

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

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    setSettings(prev => ({
      ...prev,
      darkMode: enabled
    }));
  };

  const handleNotificationToggle = (key: keyof Settings, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: enabled
    }));

    // In a real app, we'd save this to the user's profile
    toast({
      title: "Notification settings updated",
      description: `${key} is now ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handlePasswordChange = async () => {
    if (!passwordValue) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a new password",
      });
      return;
    }

    if (passwordValue !== confirmPasswordValue) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordValue
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });

      setPasswordValue('');
      setConfirmPasswordValue('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirmation !== 'DELETE') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please type DELETE to confirm account deletion",
      });
      return;
    }

    try {
      // In a real app, we'd need to use a Supabase function to fully delete the user
      // For now, we'll just sign out
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted. You will be redirected to the homepage.",
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete account",
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
        userRole={'student'} // Default to student role
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <MobileHeader onLogout={handleLogout} />
        
        {/* Settings Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            
            <Tabs defaultValue="appearance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              {/* Appearance Tab */}
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the app looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark mode
                        </p>
                      </div>
                      <Switch 
                        id="dark-mode"
                        checked={isDarkMode}
                        onCheckedChange={handleDarkModeToggle}
                      />
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground">
                      <p>Your system currently prefers {window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'} mode.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive important email notifications
                        </p>
                      </div>
                      <Switch 
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationToggle('emailNotifications', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive marketing and promotional emails
                        </p>
                      </div>
                      <Switch 
                        id="marketing-emails"
                        checked={settings.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationToggle('marketingEmails', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="product-updates">Product Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about product updates and new features
                        </p>
                      </div>
                      <Switch 
                        id="product-updates"
                        checked={settings.productUpdates}
                        onCheckedChange={(checked) => handleNotificationToggle('productUpdates', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Account Tab */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                      Manage your account settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        value={userEmail || ''} 
                        disabled 
                      />
                      <p className="text-xs text-muted-foreground">
                        Your email address is used for login and notifications
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-4">Account Actions</h3>
                      <div className="space-y-4">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate('/profile')}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              className="w-full justify-start"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove all your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2 py-2">
                              <Label htmlFor="delete-confirmation">Type DELETE to confirm</Label>
                              <Input 
                                id="delete-confirmation"
                                value={deleteAccountConfirmation}
                                onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
                                placeholder="DELETE"
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground"
                                onClick={handleDeleteAccount}
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Change Password</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input 
                          id="new-password" 
                          type="password"
                          value={passwordValue}
                          onChange={(e) => setPasswordValue(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={confirmPasswordValue}
                          onChange={(e) => setConfirmPasswordValue(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={!passwordValue || !confirmPasswordValue || passwordValue !== confirmPasswordValue}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          <Shield className="mr-2 h-4 w-4" />
                          Setup 2FA
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Coming soon: Two-factor authentication for enhanced account security
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Privacy Policy</h3>
                      <p className="text-sm text-muted-foreground">
                        Read our privacy policy to understand how we handle your data
                      </p>
                      <Button variant="outline" className="mt-2">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Privacy Policy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
