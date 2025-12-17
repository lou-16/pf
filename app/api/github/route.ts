import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { projects } from '@/content/projects';

const CACHE_FILE = path.join(process.cwd(), 'data', 'github-cache.json');
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface GitHubData {
  user: any;
  repos: any[];
  projectRepos: Record<string, any>;
  timestamp: number;
}

async function ensureCacheDir() {
  const dir = path.dirname(CACHE_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readCache(): Promise<GitHubData | null> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Check if cache is still valid
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

async function writeCache(data: GitHubData) {
  await ensureCacheDir();
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const GITHUB_USERNAME = 'lou-16';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    // Try to fetch from GitHub
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`, { headers })
    ]);

    // Fetch project repos
    const projectRepoPromises = projects.map(project =>
      fetch(`https://api.github.com/repos/${project.repo}`, { headers })
        .then(res => res.ok ? res.json() : null)
        .then(data => ({ [project.repo]: data }))
        .catch(() => ({ [project.repo]: null }))
    );
    
    const projectRepoResults = await Promise.all(projectRepoPromises);
    const projectRepos = Object.assign({}, ...projectRepoResults);

    if (userResponse.ok && reposResponse.ok) {
      const user = await userResponse.json();
      const repos = await reposResponse.json();
      
      const data: GitHubData = {
        user,
        repos,
        projectRepos,
        timestamp: Date.now()
      };

      // Cache the successful response
      await writeCache(data);

      return NextResponse.json(data);
    }

    // If rate limited or error, try to use cache
    const cached = await readCache();
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }

    // Last resort: return fallback data
    return NextResponse.json({
      user: {
        login: 'lou-16',
        avatar_url: '/IMG_0133.jpg',
        name: 'Gurnoor Singh',
        bio: '',
        public_repos: 20,
        followers: 5,
        following: 3,
        html_url: 'https://github.com/lou-16'
      },
      repos: [],
      projectRepos: {},
      timestamp: Date.now(),
      fromFallback: true
    });

  } catch (error) {
    console.error('GitHub API error:', error);

    // Try cache on any error
    const cached = await readCache();
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }

    // Fallback data
    return NextResponse.json({
      user: {
        login: 'lou-16',
        avatar_url: '/IMG_0133.jpg',
        name: 'Gurnoor Singh',
        bio: '',
        public_repos: 20,
        followers: 5,
        following: 3,
        html_url: 'https://github.com/lou-16'
      },
      repos: [],
      projectRepos: {},
      timestamp: Date.now(),
      fromFallback: true
    });
  }
}
