
import { useState } from 'react';
import { useGitHubData } from '@/hooks/use-github-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Star, GitFork, Code, Clock, Users } from 'lucide-react';

interface GitHubProfileDisplayProps {
  onSave: (username: string, userData: any, repos: any[]) => Promise<void>;
}

export function GitHubProfileDisplay({ onSave }: GitHubProfileDisplayProps) {
  const [username, setUsername] = useState('');
  const { fetchGitHubData, isLoading, userData, repos, error } = useGitHubData();
  const [saving, setSaving] = useState(false);

  const handleFetchGitHub = async () => {
    if (!username.trim()) return;
    await fetchGitHubData(username);
  };

  const handleSave = async () => {
    if (!userData || !repos.length) return;
    setSaving(true);
    try {
      await onSave(username, userData, repos);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="github-username">GitHub Username</Label>
        <div className="flex gap-2">
          <Input
            id="github-username"
            placeholder="e.g., octocat"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <Button type="button" onClick={handleFetchGitHub} disabled={isLoading || !username.trim()}>
            {isLoading ? 'Loading...' : 'Fetch'}
          </Button>
        </div>
        
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {userData && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img src={userData.avatar_url} alt={userData.login} className="w-16 h-16 rounded-full" />
                <div>
                  <h3 className="font-medium text-lg">{userData.name || userData.login}</h3>
                  <p className="text-sm text-muted-foreground">{userData.bio}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{userData.public_repos} repos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{userData.followers} followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Top Repositories</h3>
            <div className="space-y-3">
              {repos.slice(0, 3).map((repo) => (
                <Card key={repo.id}>
                  <CardContent className="py-4">
                    <h4 className="font-medium hover:underline">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        {repo.name}
                      </a>
                    </h4>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span className="text-xs">{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{repo.forks_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {repos.length > 3 && (
                <p className="text-sm text-center text-muted-foreground">
                  +{repos.length - 3} more repositories
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save to Profile'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
