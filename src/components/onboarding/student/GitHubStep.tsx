
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useGitHubData } from '@/hooks/use-github-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Plus, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const GitHubStep = () => {
  const { setStudentStep } = useOnboarding();
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    fetchGitHubData, 
    isLoading, 
    userData, 
    repos, 
    error 
  } = useGitHubData();

  useEffect(() => {
    const fetchGitHubInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('student_profiles')
          .select('github_username, github_projects')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        if (data && data.github_username) {
          setSavedUsername(data.github_username);
          setUsername(data.github_username);
          
          // Fetch the GitHub data using the saved username
          await fetchGitHubData(data.github_username);
          
          // Set selected repos from the database
          if (data.github_projects && data.github_projects.length > 0) {
            setSelectedRepos(data.github_projects);
          }
        }
      } catch (error: any) {
        // Don't display error for first-time users
        console.error("Error fetching GitHub info:", error.message);
      }
    };

    fetchGitHubInfo();
  }, [navigate, toast, fetchGitHubData]);

  const handleFetchGitHub = async () => {
    if (!username) {
      toast({
        variant: "destructive",
        title: "Username required",
        description: "Please enter your GitHub username.",
      });
      return;
    }

    try {
      await fetchGitHubData(username);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching GitHub data",
        description: error.message,
      });
    }
  };

  const toggleRepoSelection = (repo: any) => {
    // Check if repo is already selected
    const isSelected = selectedRepos.some(r => r.id === repo.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedRepos(selectedRepos.filter(r => r.id !== repo.id));
    } else {
      // Add to selection (max 5)
      if (selectedRepos.length < 5) {
        setSelectedRepos([...selectedRepos, {
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count
        }]);
      } else {
        toast({
          variant: "destructive",
          title: "Maximum selection reached",
          description: "You can select up to 5 projects.",
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('student_profiles')
        .update({
          github_username: username,
          github_projects: selectedRepos
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "GitHub info saved",
        description: "Your GitHub username and selected projects have been saved.",
      });

      setSavedUsername(username);
      setStudentStep('linkedin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving GitHub info",
        description: error.message,
      });
    }
  };

  const handleSkip = () => {
    setStudentStep('linkedin');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Connect your GitHub</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Import your GitHub projects to showcase your technical skills.
        </p>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Your GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleFetchGitHub} disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Import'}
          </Button>
        </div>
        
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}
        
        {userData && (
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <img 
                src={userData.avatar_url} 
                alt={userData.name || userData.login} 
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h4 className="font-medium">{userData.name || userData.login}</h4>
                <p className="text-sm text-muted-foreground">{userData.bio}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {userData.public_repos} repos
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userData.followers} followers
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {repos.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Select up to 5 projects to showcase</h4>
            <div className="space-y-2">
              {repos.map(repo => {
                const isSelected = selectedRepos.some(r => r.id === repo.id);
                return (
                  <div
                    key={repo.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : ''
                    }`}
                    onClick={() => toggleRepoSelection(repo)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{repo.name}</h5>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {repo.description || "No description"}
                        </p>
                        <div className="flex gap-3 mt-1">
                          {repo.language && (
                            <span className="text-xs">{repo.language}</span>
                          )}
                          {repo.stargazers_count > 0 && (
                            <span className="text-xs flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {repo.stargazers_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2">
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-purple-500" />
                        ) : (
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || (!userData && !savedUsername)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
