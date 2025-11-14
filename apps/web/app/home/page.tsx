'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { graphqlClient } from '../../lib/supabasegraphql';
import { CREATE_POST } from '../../graphql_queires/posts'
import Link from 'next/link';

type PostForm = {
  title: string;
  body: string;
  date: string;
  published: boolean;
};

type CreatePostResponse = {
  insertIntopostsCollection: {
    records: Array<{
      id: string;
      title: string;
      body: string;
      published: boolean;
      published_at: string;
      author_id: string;
    }>;
  };
};

export default function CreatePostPage() {
  const supabase = useSupabase();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState<PostForm>({
    title: '',
    body: '',
    date: new Date().toISOString().slice(0, 10),
    published: false,
  });

  // Check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      console.log('data', data);

      if (error || !data.user) {
        console.log('User not logged in');
        setLoadingUser(false);
        router.push('/auth/sign-in');
        return;
      }

      setUserId(data.user.id);
      console.log('User logged in', data.user.id);

      const profileName =
        (data.user.user_metadata as any)?.full_name ||
        (data.user.user_metadata as any)?.name ||
        data.user.email ||
        'Anonymous';

      setAuthorName(profileName);
      setLoadingUser(false);
    };

    loadUser();
  }, [router, supabase]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit post using GraphQL
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!userId) return;

    setSubmitting(true);

    try {
      console.log('🚀 Creating post with GraphQL...', {
        title: form.title,
        body: form.body,
        published: form.published,
        author_id: userId,
      });

      // Use GraphQL mutation to create post
      const data = await graphqlClient.request<CreatePostResponse>(CREATE_POST, {
        title: form.title,
        body: form.body,
        published: form.published,
        author_id: userId,
      });

      console.log('✅ GraphQL response:', data);

      const createdPost = data.insertIntopostsCollection.records[0];

      if (!createdPost) {
        throw new Error('Failed to create post');
      }

      setSuccessMessage('✅ Post created successfully!');

      // Reset form
      setForm({
        title: '',
        body: '',
        date: new Date().toISOString().slice(0, 10),
        published: false,
      });

      // Redirect after success
      setTimeout(() => {
        router.push(`/posts/${createdPost.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('❌ GraphQL error:', err);
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Back to Blog</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
            Create New Post
          </h1>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">Posting as</p>
              <p className="text-sm text-slate-500">{authorName}</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Gradient Banner */}
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>

          <div className="p-8 md:p-12">
            {/* Messages */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Post Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                  placeholder="Enter an engaging title..."
                />
              </div>

              {/* Body */}
              <div>
                <label
                  htmlFor="body"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="body"
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 font-mono text-sm resize-y"
                  placeholder="Write your content here... You can use Markdown formatting."
                />
                <p className="mt-2 text-sm text-slate-500">
                  Tip: Write in Markdown for better formatting
                </p>
              </div>

              {/* Date & Published Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>

                {/* Published Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-3 h-[50px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="published"
                        checked={form.published}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <span
                      className={`text-sm font-medium ${form.published ? 'text-indigo-600' : 'text-slate-500'}`}
                    >
                      {form.published ? '✅ Published' : '📝 Draft'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Author (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Author
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <span>{authorName}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Create Post
                    </>
                  )}
                </button>

                <Link
                  href="/"
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Need help? Check out our{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              formatting guide
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}