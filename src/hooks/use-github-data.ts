
import { useState } from 'react';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
}

interface GitHubUserData {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
}

export function useGitHubData() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<GitHubUserData | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHubData = async (username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user data
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      
      if (!userResponse.ok) {
        throw new Error(`GitHub user not found: ${username}`);
      }
      
      const userData = await userResponse.json();
      setUserData(userData);

      // Fetch repositories
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
      
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      const repos = await reposResponse.json();
      setRepos(repos);

      return { userData, repos };
    } catch (err: any) {
      setError(err.message || 'Error fetching GitHub data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchGitHubData,
    isLoading,
    userData,
    repos,
    error,
  };
}
