"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createFacebookDirectPost,
  FacebookPage,
  getFacebookAuthUrl,
  getFacebookPages,
  selectFacebookPage,
} from "@/api/facebookApi";

type DirectPostForm = {
  message: string;
  title: string;
  imageUrl: string;
  hashtags: string;
};

const INITIAL_FORM: DirectPostForm = {
  message: "",
  title: "",
  imageUrl: "",
  hashtags: "",
};

export default function FacebookPageSetup() {
  const router = useRouter();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectingPageId, setSelectingPageId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState<DirectPostForm>(INITIAL_FORM);

  const selectedPage = useMemo(
    () => pages.find((page) => page.isDefault),
    [pages]
  );

  useEffect(() => {
    void fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getFacebookPages();
      if (Array.isArray(data) && data.length > 0) {
        setPages(data);
        setConnected(true);
      } else {
        setPages([]);
        setConnected(false);
      }
    } catch (err) {
      setConnected(false);
      setPages([]);
      setError(err instanceof Error ? err.message : "Failed to fetch Facebook pages.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setError("");
    setSuccessMessage("");

    try {
      const url = await getFacebookAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Facebook.");
    }
  };

  const handleSelectPage = async (pageId: string) => {
    setSelectingPageId(pageId);
    setError("");
    setSuccessMessage("");

    try {
      await selectFacebookPage(pageId);
      await fetchPages();
      setSuccessMessage("Facebook page selected successfully.");
      // Redirect back to accounts page with connected flag
      router.push("/dashboards/settings/accounts?fb=connected");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select page.");
    } finally {
      setSelectingPageId(null);
    }
  };

  const handleDirectPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const message = form.message.trim();
    if (!message) {
      setError("Message is required for direct post.");
      return;
    }

    setPosting(true);
    try {
      const hashtags = form.hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await createFacebookDirectPost({
        message,
        title: form.title.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        hashtags: hashtags.length ? hashtags : undefined,
      });

      const postId = response.data?.postId;
      setSuccessMessage(postId ? `Direct post published. Post ID: ${postId}` : "Direct post published successfully.");
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish direct post.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Loading Facebook connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
              f
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Facebook Connection</h1>
              <p className="text-sm text-gray-500 mt-1">
                Connect your Facebook account, choose a page, and publish using direct post.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {!connected ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-6">
                Your Facebook account is not connected yet.
              </p>
              <button
                onClick={handleConnect}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Connect Facebook
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">Select the page you want to post from:</p>
                  <button
                    onClick={handleConnect}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Reconnect
                  </button>
                </div>

                <div className="space-y-2">
                  {pages.map((page) => (
                    <div
                      key={page.pageId}
                      className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                        page.isDefault ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{page.pageName || page.pageId}</p>
                        {page.isDefault && (
                          <p className="text-xs text-blue-600 font-medium mt-0.5">Currently selected</p>
                        )}
                      </div>

                      {page.isDefault ? (
                        <span className="text-xs font-semibold text-blue-700">Selected</span>
                      ) : (
                        <button
                          onClick={() => handleSelectPage(page.pageId)}
                          disabled={Boolean(selectingPageId)}
                          className="px-4 py-1.5 rounded-lg border border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-50 disabled:opacity-50"
                        >
                          {selectingPageId === page.pageId ? "Saving..." : "Select"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Direct Post</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Endpoint: POST /facebook/direct-post {selectedPage ? `(page: ${selectedPage.pageName || selectedPage.pageId})` : ""}
                </p>

                <form className="space-y-3" onSubmit={handleDirectPost}>
                  <textarea
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Message (required)"
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Title (optional)"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Image URL (optional)"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Hashtags, comma-separated (optional)"
                    value={form.hashtags}
                    onChange={(e) => setForm((prev) => ({ ...prev, hashtags: e.target.value }))}
                  />
                  <button
                    type="submit"
                    disabled={posting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
                  >
                    {posting ? "Posting..." : "Publish Direct Post"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}