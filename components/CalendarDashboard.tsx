"use client";

import { useCalendarApi } from "@/hooks/useCalendarApi";
import { useEffect, useState } from "react";
import { Post } from "@/api/calendarApi";

// Toast notification component
function Toast({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  const bgColor = {
    success: "#d1fae5",
    error: "#fee2e2",
    info: "#dbeafe",
  }[type];

  const textColor = {
    success: "#065f46",
    error: "#7f1d1d",
    info: "#1e3a8a",
  }[type];

  const icon = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  }[type];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: bgColor,
        color: textColor,
        padding: "15px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        maxWidth: "400px",
      }}
    >
      <span>{icon}</span>
      <span style={{ fontSize: "14px", fontWeight: 500 }}>{message}</span>
    </div>
  );
}

// Modal component for creating/editing plans
function CreatePlanModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { prompt: string; subIndustries: string[]; postTime: string }) => void;
  loading: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const [subIndustry, setSubIndustry] = useState("");
  const [postTime, setPostTime] = useState("14:30");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    if (!subIndustry.trim()) {
      alert("Please enter a sub-industry ID");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(postTime)) {
      alert("Please enter time in HH:MM format");
      return;
    }

    onSubmit({
      prompt,
      subIndustries: [subIndustry],
      postTime,
    });

    setPrompt("");
    setSubIndustry("");
    setPostTime("14:30");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 25px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, color: "#1f2937" }}>Create Monthly Plan</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, color: "#374151" }}>
              Content Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Best fitness content for March"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "14px",
                minHeight: "80px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, color: "#374151" }}>
              Sub-Industry ID
            </label>
            <input
              type="text"
              value={subIndustry}
              onChange={(e) => setSubIndustry(e.target.value)}
              placeholder="e.g., cb305c5e-bfb8-4c50-a3a9-f1e00d4178e1"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, color: "#374151" }}>
              Post Time (HH:MM)
            </label>
            <input
              type="time"
              value={postTime}
              onChange={(e) => setPostTime(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Creating..." : "Create Plan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Post detail modal for viewing/editing
function PostDetailModal({
  isOpen,
  post,
  onClose,
  onUpdate,
  loading,
}: {
  isOpen: boolean;
  post: Post | null;
  onClose: () => void;
  onUpdate: (updates: { contentText?: string; postTime?: string }) => void;
  loading: boolean;
}) {
  const [contentText, setContentText] = useState("");
  const [postTime, setPostTime] = useState("");

  useEffect(() => {
    if (post) {
      setContentText(post.content.text);
      setPostTime(post.postTime.slice(0, 16)); // Extract date and time
    }
  }, [post]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      contentText: contentText !== post?.content.text ? contentText : undefined,
      postTime: postTime !== post?.postTime ? new Date(postTime).toISOString() : undefined,
    });
  };

  if (!isOpen || !post) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, color: "#1f2937" }}>Edit Post</h2>

        {post.media.type === "IMAGE" && (
          <div style={{ marginBottom: "20px" }}>
            <img
              src={post.media.file}
              alt="Post"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, color: "#374151" }}>
              Content
            </label>
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "14px",
                minHeight: "100px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, color: "#374151" }}>
              Post Time
            </label>
            <input
              type="datetime-local"
              value={postTime}
              onChange={(e) => setPostTime(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, color: "#374151" }}>
              Hashtags
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {post.content.hashtags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main calendar dashboard component
export default function CalendarDashboard() {
  const { fetchPlan, createPlan, updatePost, fetchRandomImage, loading, error } = useCalendarApi();
  const [posts, setPosts] = useState<Post[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load posts on mount
  useEffect(() => {
    const loadPosts = async () => {
      const response = await fetchPlan();
      if (response?.success && response.posts) {
        setPosts(response.posts);
        showToast("Posts loaded successfully!", "success");
      } else if (response?.message) {
        showToast(response.message, "info");
      }
    };

    loadPosts();
  }, [fetchPlan]);

  const handleCreatePlan = async (data: { prompt: string; subIndustries: string[]; postTime: string }) => {
    const response = await createPlan(data);
    if (response?.success) {
      showToast(`Plan created with ${response.totalPosts} posts!`, "success");
      // Refresh posts after plan creation
      const planResponse = await fetchPlan();
      if (planResponse?.posts) {
        setPosts(planResponse.posts);
      }
      setCreateModalOpen(false);
    } else {
      showToast(response?.message || "Failed to create plan", "error");
    }
  };

  const handleUpdatePost = async (updates: { contentText?: string; postTime?: string }) => {
    if (!selectedPost) return;

    const response = await updatePost(selectedPost.postId, updates);
    if (response?.success) {
      showToast("Post updated successfully!", "success");
      // Refresh posts
      const planResponse = await fetchPlan();
      if (planResponse?.posts) {
        setPosts(planResponse.posts);
      }
      setDetailModalOpen(false);
    } else {
      showToast(response?.message || "Failed to update post", "error");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      // Note: Delete is not directly available in API, but can be done via plan recreation
      showToast("Delete feature coming soon", "info");
    } catch {
      showToast("Failed to delete post", "error");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header with action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#1f2937" }}>📅 Calendar Dashboard</h1>
          <p style={{ margin: "5px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
            Manage your content calendar and schedule posts
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setCreateModalOpen(true)}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "14px",
            }}
          >
            📅 Create Monthly Plan
          </button>

          <button
            onClick={async () => {
              const response = await fetchPlan();
              if (response?.success) {
                setPosts(response.posts || []);
                showToast("Posts refreshed!", "success");
              }
            }}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "14px",
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div style={{ backgroundColor: "#f0f9ff", padding: "20px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#1e40af", fontWeight: 600 }}>TOTAL POSTS</p>
          <p style={{ margin: "10px 0 0 0", fontSize: "28px", fontWeight: 700, color: "#1f2937" }}>
            {posts.length}
          </p>
        </div>

        <div style={{ backgroundColor: "#ecfdf5", padding: "20px", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#065f46", fontWeight: 600 }}>SCHEDULED</p>
          <p style={{ margin: "10px 0 0 0", fontSize: "28px", fontWeight: 700, color: "#1f2937" }}>
            {posts.filter((p) => p.status === "SCHEDULED").length}
          </p>
        </div>

        <div style={{ backgroundColor: "#fef3c7", padding: "20px", borderRadius: "8px", border: "1px solid #fcd34d" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#92400e", fontWeight: 600 }}>DRAFTS</p>
          <p style={{ margin: "10px 0 0 0", fontSize: "28px", fontWeight: 700, color: "#1f2937" }}>
            {posts.filter((p) => p.status === "DRAFT").length}
          </p>
        </div>

        <div style={{ backgroundColor: "#fef2f2", padding: "20px", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#7f1d1d", fontWeight: 600 }}>PUBLISHED</p>
          <p style={{ margin: "10px 0 0 0", fontSize: "28px", fontWeight: 700, color: "#1f2937" }}>
            {posts.filter((p) => p.status === "PUBLISHED").length}
          </p>
        </div>
      </div>

      {/* Posts list */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {loading && posts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            <p style={{ margin: 0 }}>⏳ Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            <p style={{ margin: 0, fontSize: "16px" }}>📭 No posts yet</p>
            <p style={{ margin: "10px 0 0 0", fontSize: "13px" }}>Click "Create Plan" to generate your first content plan</p>
          </div>
        ) : (
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {posts.map((post, index) => (
              <div
                key={post.postId}
                style={{
                  display: "flex",
                  gap: "15px",
                  padding: "15px",
                  borderBottom: index < posts.length - 1 ? "1px solid #e5e7eb" : "none",
                  alignItems: "flex-start",
                }}
              >
                {/* Post image */}
                {post.media.file && (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={post.media.file}
                      alt="Post"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Post details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "14px",
                      color: "#1f2937",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {post.content.text}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                    {post.content.hashtags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "11px",
                          color: "#5b5bd6",
                          backgroundColor: "#eeeeff",
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      fontSize: "13px",
                      color: "#6b7280",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>📅 {new Date(post.postTime).toLocaleDateString()}</span>
                    <span>⏰ {new Date(post.postTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span
                      style={{
                        padding: "2px 10px",
                        backgroundColor:
                          post.status === "SCHEDULED"
                            ? "#dbeafe"
                            : post.status === "DRAFT"
                              ? "#fef3c7"
                              : "#d1fae5",
                        color:
                          post.status === "SCHEDULED"
                            ? "#0c4a6e"
                            : post.status === "DRAFT"
                              ? "#78350f"
                              : "#065f46",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setDetailModalOpen(true);
                    }}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => handleDeletePost(post.postId)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#fee2e2",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#991b1b",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePlanModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreatePlan}
        loading={loading}
      />

      <PostDetailModal
        isOpen={detailModalOpen}
        post={selectedPost}
        onClose={() => setDetailModalOpen(false)}
        onUpdate={handleUpdatePost}
        loading={loading}
      />

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Error banner */}
      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "15px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 999,
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
