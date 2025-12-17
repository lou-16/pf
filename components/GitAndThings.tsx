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

    useEffect(() => {
        const fetchGitHubData = async () => {
            try {
                setLoading(true)
                
                // Fetch from our API route which handles caching
                const response = await fetch('/api/github')
                if (!response.ok) {
                    throw new Error('Failed to fetch GitHub data')
                }
                
                const data = await response.json()
                setUserData(data.user)
                setRepos(data.repos || [])
                
                setLoading(false)
            } catch (err) {
                console.error('GitHub fetch error:', err)
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
        <div className='flex flex-col items-start gap-3 w-full max-w-xs'>
            {/* Profile Image - circular like GitHub */}
            <div className="w-full mb-2">
                <Image 
                    src={userData?.avatar_url || "/IMG_0133.jpg"}
                    alt={userData?.name || 'Profile picture'} 
                    width={200}
                    height={200}  
                    className='rounded-full w-full h-auto max-w-[200px] mx-auto border-2 border-gray-700' 
                />
            </div>

            {/* GitHub Profile Info */}
            {userData && (
                <div className="flex flex-col gap-2 text-white w-full">
                    {/* Name and Username */}
                    <div>
                        <h1 className="font-semibold text-lg">{userData.name}</h1>
                        <p className="text-base text-gray-400 font-light">{userData.login}</p>
                    </div>
                    
                    {/* Bio */}
                    {userData.bio && (
                        <p className="text-sm leading-relaxed">{userData.bio}</p>
                    )}

                    {/* Followers/Following */}
                    <div className="flex gap-3 text-xs items-center">
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