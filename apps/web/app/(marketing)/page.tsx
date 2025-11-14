"use client"

import { useEffect, useMemo, useState } from "react"
import { graphqlClient } from "../../lib/supabasegraphql"
import { GET_POSTS } from "../../graphql_queires/posts"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

type PostNode = {
  id: string
  title: string
  body: string
  published_at: string
  authors?: { name: string } | null
}

type PostsResponse = {
  postsCollection: {
    edges: Array<{ node: PostNode }>
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

const PER_PAGE = 5

export default function BlogHomepage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [posts, setPosts] = useState<PostNode[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const offset = useMemo(() => (page - 1) * PER_PAGE, [page])

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsSignedIn(!!session)
    }
    
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    let cancelled = false
    
    async function load() {
      setLoading(true)
      setError(null)
      
      try {
        console.log('🔍 Fetching posts with GraphQL...', { offset, limit: PER_PAGE })
        
        const data = await graphqlClient.request<PostsResponse>(GET_POSTS, {
          limit: PER_PAGE,
          offset: offset,
        })

        console.log('📝 GraphQL response:', data)

        if (!cancelled) {
          const postNodes = data.postsCollection.edges.map(edge => edge.node)
          setPosts(postNodes)
          setHasNextPage(data.postsCollection.pageInfo.hasNextPage)
          setHasPreviousPage(data.postsCollection.pageInfo.hasPreviousPage)
        }
      } catch (e: any) {
        console.error('❌ GraphQL error:', e)
        if (!cancelled) {
          setError(e.message ?? "Failed to load posts")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    load()
    return () => { cancelled = true }
  }, [offset])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    if (newPage === page + 1 && !hasNextPage) return
    if (newPage === page - 1 && !hasPreviousPage) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setPage(newPage)
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header with Login/Create Button */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Latest Posts</h1>
            <p className="text-slate-600">Discover stories, thinking, and expertise</p>
          </div>
          
          {isSignedIn ? (
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              Create New Post
            </Link>
          ) : (
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                />
              </svg>
              Login to Create Post
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            ❌ {error}
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200/60 bg-white p-8">
                <div className="mb-3 h-4 w-48 rounded bg-slate-200" />
                <div className="mb-2 h-7 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className={`space-y-6 transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            {posts.map((post, index) => {
              const excerpt = post.body?.slice(0, 180) ?? ""
              const when = post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "Unpublished"
              const authorName = post.authors?.name ?? "Unknown author"

              return (
                <article
                  key={post.id}
                  onClick={() => router.push(`/posts/${post.id}`)}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/60 hover:border-indigo-200 cursor-pointer hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isAnimating ? "none" : "fadeInUp 0.6s ease-out forwards"
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {when}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1.5 font-medium text-indigo-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {authorName}
                      </span>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full">Article</span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-slate-600 leading-relaxed mb-4">
                    {excerpt}
                    {post.body && post.body.length > 180 ? "..." : ""}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      5 min read
                    </div>
                    <span className="text-indigo-600 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                      Read more
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </article>
              )
            })}

            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No posts found.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!hasPreviousPage}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              hasPreviousPage 
                ? "bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md hover:-translate-x-1 border border-slate-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Page {page}</span>
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasNextPage}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              hasNextPage 
                ? "bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md hover:translate-x-1 border border-slate-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}