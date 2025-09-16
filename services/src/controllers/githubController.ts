import { Request, Response } from 'express';
import { getUserPublicProfile, getUserPublicRepos } from '../services/github';

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

export { fetchGitHubUserProfile, fetchGitHubUserRepos };
