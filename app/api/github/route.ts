import { NextResponse } from "next/server";
import { projects } from "@/content/projects";

export const revalidate = 3600; // 1 hour ISR (Vercel global cache)

interface GitHubData {
  user: any;
  repos: any[];
  projectRepos: Record<string, any>;
  events: any[];
  timestamp: number;
}

export async function GET() {
  const USERNAME = "lou-16";
  const TOKEN = process.env.GITHUB_TOKEN;

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
  };

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`,
        {
          headers,
          next: { revalidate: 3600 },
        }
      ),
      fetch(
        `https://api.github.com/users/${USERNAME}/events/public?per_page=30`,
        {
          headers,
          next: { revalidate: 3600 },
        }
      ),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      throw new Error("GitHub API request failed");
    }

    const user = await userRes.json();
    const allRepos = await reposRes.json();
    const events = eventsRes.ok ? await eventsRes.json() : [];

    // Only expose recent repos (same as before)
    const repos = allRepos.slice(0, 6);

    // Build repo lookup table
    const repoMap = Object.fromEntries(
      allRepos.map((r: any) => [r.full_name, r])
    );

    // Resolve project repos locally (no extra GitHub calls)
    const projectRepos = Object.fromEntries(
      projects.map((p) => [p.repo, repoMap[p.repo] ?? null])
    );

    const data: GitHubData = {
      user,
      repos,
      projectRepos,
      events,
      timestamp: Date.now(),
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("GitHub API error:", err);

    // Graceful fallback (never breaks the UI)
    return NextResponse.json({
      user: {
        login: "lou-16",
        avatar_url: "/IMG_0133.jpg",
        name: "Gurnoor Singh",
        bio: "",
        public_repos: 20,
        followers: 5,
        following: 3,
        html_url: "https://github.com/lou-16",
      },
      repos: [],
      projectRepos: {},
      events: [],
      timestamp: Date.now(),
      fromFallback: true,
    });
  }
}
