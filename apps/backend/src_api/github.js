/**
 * GitHub API Integration
 * Endpoints para integração com GitHub
 */

// GitHub API base URL
const GITHUB_API = 'https://api.github.com';

// Get GitHub token from environment
const getGitHubToken = () => {
  return process.env.GITHUB_TOKEN || null;
};

/**
 * Get authenticated user info
 */
export const getGitHubUser = async (req, res) => {
  try {
    const token = getGitHubToken();
    
    if (!token) {
      return res.status(401).json({ 
        error: 'GitHub token not configured',
        message: 'Set GITHUB_TOKEN environment variable'
      });
    }

    const response = await fetch(`${GITHUB_API}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Diana-Dashboard'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following
    });
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch GitHub user',
      message: error.message 
    });
  }
};

/**
 * Get user repositories
 */
export const getGitHubRepos = async (req, res) => {
  try {
    const token = getGitHubToken();
    
    if (!token) {
      return res.status(401).json({ 
        error: 'GitHub token not configured' 
      });
    }

    const { sort = 'updated', per_page = 10 } = req.query;

    const response = await fetch(
      `${GITHUB_API}/user/repos?sort=${sort}&per_page=${per_page}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Diana-Dashboard'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    const repos = data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at
    }));

    res.json(repos);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      message: error.message 
    });
  }
};

/**
 * Get repository commits
 */
export const getGitHubCommits = async (req, res) => {
  try {
    const token = getGitHubToken();
    
    if (!token) {
      return res.status(401).json({ 
        error: 'GitHub token not configured' 
      });
    }

    const { owner, repo, per_page = 10 } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ 
        error: 'Missing required parameters: owner, repo' 
      });
    }

    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=${per_page}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Diana-Dashboard'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    const commits = data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date
      },
      html_url: commit.html_url
    }));

    res.json(commits);
  } catch (error) {
    console.error('Error fetching GitHub commits:', error);
    res.status(500).json({ 
      error: 'Failed to fetch commits',
      message: error.message 
    });
  }
};

/**
 * Get repository pull requests
 */
export const getGitHubPullRequests = async (req, res) => {
  try {
    const token = getGitHubToken();
    
    if (!token) {
      return res.status(401).json({ 
        error: 'GitHub token not configured' 
      });
    }

    const { owner, repo, state = 'open', per_page = 10 } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ 
        error: 'Missing required parameters: owner, repo' 
      });
    }

    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/pulls?state=${state}&per_page=${per_page}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Diana-Dashboard'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    const prs = data.map(pr => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      user: {
        login: pr.user.login,
        avatar_url: pr.user.avatar_url
      },
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      html_url: pr.html_url
    }));

    res.json(prs);
  } catch (error) {
    console.error('Error fetching GitHub PRs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pull requests',
      message: error.message 
    });
  }
};
