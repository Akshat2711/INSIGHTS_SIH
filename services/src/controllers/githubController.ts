import { Request, Response } from 'express';
import {
  getUserPublicProfile,
  getUserPublicRepos,
  getUserRepoCommits,
  getCommitStats,
} from '../services/github';

const fetchGitHubUserProfile = async (req: Request, res: Response) => {
  try {
    const username = req.params.githubUsername;
    if (!username) {
      res.status(400).json({
        status: 'error',
        message: 'Username is required',
      });
      return;
    }
    const userProfile = await getUserPublicProfile(username);
    if (userProfile) {
      const profileData = {
        username: userProfile.login,
        name: userProfile.name,
        bio: userProfile.bio,
        location: userProfile.location,
        public_repos: userProfile.public_repos,
        public_gists: userProfile.public_gists,
        followers: userProfile.followers,
        following: userProfile.following,
        avatar_url: userProfile.avatar_url,
        github_url: userProfile.html_url,
      };
      res.status(200).json({
        status: 'success',
        data: profileData,
        message: 'GitHub user profile fetched successfully',
      });
      return;
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch GitHub user profile',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch GitHub user profile',
    });
    return;
  }
};

const fetchGitHubUserRepos = async (req: Request, res: Response) => {
  try {
    const username = req.params.githubUsername;
    if (!username) {
      res.status(400).json({
        status: 'error',
        message: 'Username is required',
      });
      return;
    }
    const userRepos = await getUserPublicRepos(username);
    if (userRepos) {
      res.status(200).json({
        status: 'success',
        data: userRepos,
        message: 'GitHub user repositories fetched successfully',
      });
      return;
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch GitHub user repositories',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch GitHub user repositories',
    });
    return;
  }
};

const fetchRepoCommits = async (req: Request, res: Response) => {
  try {
    const username = req.params.githubUsername;
    const repoName = req.params.repoName;
    if (!username || !repoName) {
      res.status(400).json({
        status: 'error',
        message: 'Username and repository name are required',
      });
      return;
    }
    const commits = await getUserRepoCommits(username, repoName);
    if (commits) {
      res.status(200).json({
        status: 'success',
        data: { commits, total_count: commits.length },
        message: 'GitHub repository commits fetched successfully',
      });
      return;
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch GitHub repository commits',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch GitHub repository commits',
    });
    return;
  }
};

const fetchCommitStatistics = async (req: Request, res: Response) => {
  try {
    const username = req.params.githubUsername;
    const repoName = req.params.repoName;
    const sha = req.params.sha;
    if (!username || !repoName || !sha) {
      res.status(400).json({
        status: 'error',
        message: 'Username, repository name, and commit SHA are required',
      });
      return;
    }
    const stats = await getCommitStats(username, repoName, sha);
    if (stats) {
      res.status(200).json({
        status: 'success',
        data: stats,
        message: 'GitHub commit statistics fetched successfully',
      });
      return;
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch GitHub commit statistics',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch GitHub commit statistics',
    });
    return;
  }
};

export {
  fetchGitHubUserProfile,
  fetchGitHubUserRepos,
  fetchRepoCommits,
  fetchCommitStatistics,
};
