"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface GitHubUser {
  login: string
  avatar_url: string
  name: string
  bio: string
  public_repos: number
  followers: number
  following: number
  html_url: string
}

interface GitHubRepo {
  id: number
  name: string
  description: string
  stargazers_count: number
  forks_count: number
  html_url: string
  language: string
}

export default function GitAndThings()
{
    const [userData, setUserData] = useState<GitHubUser | null>(null)
    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const GITHUB_USERNAME = 'lou-16'

    useEffect(() => {
        const fetchGitHubData = async () => {
            try {
                setLoading(true)
                
                // Fetch user data
                const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
                if (!userResponse.ok) throw new Error('Failed to fetch user data')
                const user = await userResponse.json()
                setUserData(user)

                // Fetch repositories
                const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`)
                if (!reposResponse.ok) throw new Error('Failed to fetch repositories')
                const reposData = await reposResponse.json()
                setRepos(reposData)

                setLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
                setLoading(false)
            }
        }

        fetchGitHubData()
    }, [])

    if (loading) {
        return (
            <div className='flex items-center justify-start p-6'>
                <div className="animate-pulse space-y-4">
                    <div className="w-64 h-64 bg-gray-700 rounded-full" />
                    <div className="h-6 bg-gray-700 rounded w-48" />
                    <div className="h-4 bg-gray-700 rounded w-32" />
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col items-start gap-4 w-full max-w-xs p-4'>
            {/* Profile Image - circular like GitHub */}
            <div className="w-full mb-4">
                <Image 
                    src={userData?.avatar_url || "/IMG_0133.jpg"}
                    alt={userData?.name || 'Profile picture'} 
                    width={296}
                    height={296}  
                    className='rounded-full w-full h-auto border-2 border-gray-700' 
                />
            </div>

            {/* GitHub Profile Info */}
            {userData && (
                <div className="flex flex-col gap-3 text-white w-full">
                    {/* Name and Username */}
                    <div>
                        <h1 className="font-semibold text-2xl">{userData.name}</h1>
                        <p className="text-xl text-gray-400 font-light">{userData.login}</p>
                    </div>
                    
                    {/* Bio */}
                    {userData.bio && (
                        <p className="text-base leading-relaxed">{userData.bio}</p>
                    )}

                    {/* Followers/Following */}
                    <div className="flex gap-4 text-sm items-center">
                        <a 
                            href={`${userData.html_url}?tab=followers`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-400 transition-colors"
                        >
                            <span className="text-white font-semibold">{userData.followers}</span>
                            <span className="text-gray-400 ml-1">followers</span>
                        </a>
                        <span className="text-gray-600">·</span>
                        <a 
                            href={`${userData.html_url}?tab=following`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-400 transition-colors"
                        >
                            <span className="text-white font-semibold">{userData.following}</span>
                            <span className="text-gray-400 ml-1">following</span>
                        </a>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-red-400 text-sm">
                    {error}
                </div>
            )}
        </div>
    )
}