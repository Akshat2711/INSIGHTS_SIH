import {
  fetchGitHubUserProfile,
  fetchGitHubUserRepos,
} from '../controllers/githubController';
import { Router } from 'express';

const router = Router();

router.get('/v1/github/user/:githubUsername', fetchGitHubUserProfile);
router.get('/v1/github/user/:githubUsername/repos', fetchGitHubUserRepos);

export default router;
