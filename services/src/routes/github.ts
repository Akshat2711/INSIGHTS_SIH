import {
  fetchGitHubUserProfile,
  fetchGitHubUserRepos,
  fetchRepoCommits,
  fetchCommitStatistics,
} from '../controllers/githubController';
import { Router } from 'express';

const router = Router();

router.get('/v1/github/user/:githubUsername', fetchGitHubUserProfile);
router.get('/v1/github/user/:githubUsername/repos', fetchGitHubUserRepos);
router.get(
  '/v1/github/user/:githubUsername/repos/:repoName/commits',
  fetchRepoCommits,
);
router.get(
  '/v1/github/user/:githubUsername/repos/:repoName/commits/:sha/stats',
  fetchCommitStatistics,
);

export default router;
