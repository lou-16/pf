"use client"

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { projects } from "@/content/projects";

interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string;
  topics: string[];
}

export default function ProjectsSection() {
  const [repoData, setRepoData] = useState<Record<string, GitHubRepo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const data: Record<string, GitHubRepo> = {};
        
        await Promise.all(
          projects.map(async (project) => {
            const response = await fetch(`https://api.github.com/repos/${project.repo}`);
            if (response.ok) {
              data[project.repo] = await response.json();
            }
          })
        );
        
        setRepoData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching repo data:", error);
        setLoading(false);
      }
    };

    fetchRepoData();
  }, []);

  return (
    <section
      id="projects"
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-black"
    >
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 sm:mb-8 text-center">Projects</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white border-gray-300 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          projects.map((project) => {
            const repo = repoData[project.repo];
            if (!repo) return null;

            return (
              <Card 
                key={project.repo} 
                className="bg-white border-gray-300 hover:border-gray-500 hover:shadow-lg transition-all duration-200"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <a 
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {repo.name}
                    </a>
                    {project.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    {project.customDescription || repo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                    >
                      View Demo →
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
