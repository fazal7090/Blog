import { graphqlClient } from "../../../lib/supabasegraphql"
import { GET_POST_BY_ID } from "../../../graphql_queires/posts"
import { notFound } from "next/navigation"
import Link from "next/link"

type PostNode = {
  id: string
  title: string
  body: string
  published_at: string
  authors?: { name: string } | null
}

type PostResponse = {
  postsCollection: {
    edges: Array<{ node: PostNode }>
  }
}

type PostDetailProps = {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: PostDetailProps) {
  const { id } = await params

  let post: PostNode | null = null

  try {
    // Fetch post using GraphQL
    const data = await graphqlClient.request<PostResponse>(GET_POST_BY_ID, {
      id: id,
    })

    // Extract post from GraphQL response
    const edges = data.postsCollection.edges
    if (edges.length === 0) {
      return notFound()
    }

    post = edges[0]?.node || null
  } catch (error) {
    console.error('GraphQL error:', error)
    return notFound()
  }

  if (!post) {
    return notFound()
  }

  const when = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "Unpublished"

  const authorName = post.authors?.name ?? "Unknown author"

  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = post.body?.split(/\s+/).length ?? 0
  const readTime = Math.ceil(wordCount / 200)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with back button */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Blog</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Article Header */}
        <article className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Hero gradient banner */}
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>

          <div className="p-8 md:p-12">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Article
              </span>

              <span className="inline-flex items-center gap-2 text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {when}
              </span>

              <span className="inline-flex items-center gap-2 text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-4 pb-8 mb-8 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{authorName}</p>
                <p className="text-sm text-slate-500">Author</p>
              </div>
            </div>

            {/* Article content */}
            <div
              className="prose prose-slate prose-lg max-w-none
    prose-headings prose-headings:text-slate-900
    text-slate-600 font-medium
    prose-p:text-slate-100 prose-p:leading-relaxed prose-p:mb-6
    prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
    prose-strong:text-slate-100 prose-strong:font-semibold
    prose-code:text-indigo-300 prose-code:bg-indigo-50/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
    prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-xl prose-pre:shadow-lg
    prose-blockquote:border-l-4 prose-blockquote:border-indigo-600 prose-blockquote:bg-indigo-50/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
    prose-ul:list-disc prose-ul:ml-6
    prose-ol:list-decimal prose-ol:ml-6
    prose-li:text-slate-100 prose-li:mb-2
    prose-img:rounded-xl prose-img:shadow-lg"
            >

              {post.body}
            </div>
          </div>

          {/* Footer actions */}
          <div className="bg-slate-50 px-8 md:px-12 py-6 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                Read More Articles
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}