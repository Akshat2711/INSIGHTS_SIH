import logger from '../utils/logger';
import { config } from '../config/config';
import { watch } from 'fs';

const getUserPublicProfile = async (username: string) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `Bearer ${config.github.personalAccessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Failed to fetch GitHub user profile:', error);
    throw error;
  }
};

const getUserPublicRepos = async (username: string) => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: {
          Authorization: `Bearer ${config.github.personalAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format from GitHub API');
    }
    let repo_data = [];

    for (const repo of data) {
      let languages: string[] = [];

      const langResponse = await fetch(repo.languages_url, {
        headers: {
          Authorization: `Bearer ${config.github.personalAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (langResponse.ok) {
        const langData = await langResponse.json();
        languages = Object.keys(langData);
      } else {
        logger.warn(
          `Failed to fetch languages for repo ${repo.name}: ${langResponse.statusText}`,
        );
      }
      repo_data.push({
        name: repo.name,
        description: repo.description,
        topics: repo.topics,
        repo_url: repo.html_url,
        total_stars: repo.stargazers_count,
        total_forks: repo.forks_count,
        watchers_count: repo.watchers_count,
        open_issues_count: repo.open_issues_count,
        is_fork: repo.fork,
        repo_languages: languages,
        git_url: repo.git_url,
        clone_url: repo.clone_url,
        primary_language: repo.language,
      });
    }
    return repo_data;
  } catch (error) {
    logger.error('Failed to fetch GitHub user repositories:', error);
    throw error;
  }
};

export { getUserPublicProfile, getUserPublicRepos };
