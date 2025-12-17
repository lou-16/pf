export interface Project {
  repo: string; // format: "owner/repo-name"
  featured?: boolean;
  demoUrl?: string;
  customDescription?: string;
  tags?: string[];
}

export const projects: Project[] = [
  {
    repo: "lou-16/krnl",
    featured: true,
    customDescription: "A WIP kernel created from scratch in C.",
    tags: ["Operating Systems", "Low-level", "C"],
  },
  {
    repo: "lou-16/cassie",
    featured: true,
    customDescription: "Mirror Repo for the GitLab repository for this project.",
    tags: ["C++"],
  },
  {
    repo: "lou-16/fsprintf",
    featured: false,
    customDescription: "Freestanding printf that I wrote for my kernel. Plans to add driver support later.",
    tags: ["C", "Kernel Development"],
  },
  {
    repo: "lou-16/prabhaavField",
    featured: true,
    customDescription: "An Expo Go app implemented under PS25250 for team CogniForge's solution",
    tags: ["TypeScript", "React Native", "Expo"],
  },
];
