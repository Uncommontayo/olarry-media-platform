import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { fetchFeed, likePost, deletePost, generateAICaption } from "../api";

export default function Feed({ search }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    setLoading(true);
    try {
      const data = await fetchFeed();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchFeed failed:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  // Build a quick map of username -> profile picture URL by scanning '__profile_pic__' posts (latest wins)
  const profileMap = {};
  for (const p of posts) {
    if (p.caption === '__profile_pic__' && !profileMap[p.username]) {
      profileMap[p.username] = p.url;
    }
  }

  // Exclude profile picture posts from the visible feed
  const visiblePosts = posts.filter((p) => p.caption !== '__profile_pic__');

  const q = (search || "").toLowerCase();
  const filtered = visiblePosts.filter((p) =>
    (p.caption || "").toLowerCase().includes(q) ||
    (p.username || "").toLowerCase().includes(q)
  );

  useEffect(() => {
    loadFeed();
  }, []);


  const handleLike = async (name) => {
    // optimistic UI update
    setPosts((prev) => prev.map((p) => (p.name === name ? { ...p, likes: (p.likes || 0) + 1 } : p)));
    try {
      await likePost(name);
    } catch (err) {
      console.error("likePost failed:", err);
      loadFeed();
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm("Delete this post permanently?")) return;
    const prev = posts;
    setPosts((p) => p.filter((x) => x.name !== name));
    try {
      await deletePost(name);
    } catch (err) {
      console.error("deletePost failed:", err);
      setPosts(prev);
      // surface a simple user-visible error
      window.alert(`Delete failed: ${err?.message || err}`);
    }
  };

  const handleAICaption = async (name) => {
    try {
      const res = await generateAICaption(name);
      if (res?.caption) {
        setPosts((prev) => prev.map((p) => (p.name === name ? { ...p, caption: res.caption } : p)));
      }
    } catch (err) {
      console.error("AICaption failed:", err);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading feed…</p>;
  }

  return (
    <div className="container">
      <div className="feed-grid" role="list">
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>No posts found.</p>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.name}
              post={post}
              profileUrl={profileMap[post.username]}
              onLike={() => handleLike(post.name)}
              onDelete={() => handleDelete(post.name)}
              onAICaption={() => handleAICaption(post.name)}
            />
          ))
        )}
      </div>
    </div>
  );
}
