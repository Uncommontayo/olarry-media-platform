import { useEffect, useState, useCallback } from "react";
import PostCard from "../components/PostCard";
import MediaDetail from "../components/MediaDetail";
import { fetchFeed, searchMedia, likePost } from "../api";
import { theme } from "../styles/theme";

export default function Feed({ search, filterUsername }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [likingPosts, setLikingPosts] = useState(new Set());

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = search ? await searchMedia(search) : await fetchFeed();
      const validPosts = Array.isArray(data) ? data : [];
      
      // Filter out profile pictures
      const visiblePosts = validPosts.filter((p) => p.caption !== '__profile_pic__');
      
      setPosts(visiblePosts);
    } catch (e) {
      console.error("Failed to load feed:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Filter by username if needed
  let filteredPosts = posts;
  if (filterUsername) {
    filteredPosts = posts.filter(p => p.username === filterUsername);
  }

  // Apply search filter (caption, username, location, tagged people)
  if (search) {
    const q = search.toLowerCase();
    filteredPosts = filteredPosts.filter(p =>
      (p.caption || "").toLowerCase().includes(q) ||
      (p.title || "").toLowerCase().includes(q) ||
      (p.username || "").toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.tagged_people || []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  const handleLike = async (name) => {
    // Prevent double-clicks
    if (likingPosts.has(name)) return;
    
    setLikingPosts(prev => new Set(prev).add(name));
    
    // Optimistic update
    setPosts((prev) => prev.map((p) => (p.name === name ? { ...p, likes: (p.likes || 0) + 1 } : p)));
    
    try {
      const result = await likePost(name);
      // Update with actual count from backend
      if (result && result.likes !== undefined) {
        setPosts((prev) => prev.map((p) => (p.name === name ? { ...p, likes: result.likes } : p)));
      }
    } catch (err) {
      console.error("Like failed:", err);
      // Revert optimistic update on error
      setPosts((prev) => prev.map((p) => (p.name === name ? { ...p, likes: (p.likes || 1) - 1 } : p)));
    } finally {
      // Re-enable after 1 second
      setTimeout(() => {
        setLikingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        color: theme.colors.textMuted
      }}>
        <p>Loading feed…</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        {/* Search Results Header */}
        {search && (
          <div style={{
            marginBottom: 24,
            padding: 16,
            background: theme.colors.card,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadow.soft
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              color: theme.colors.text,
              fontWeight: 600
            }}>
              {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{search}"
            </h2>
          </div>
        )}

        {filterUsername && (
          <div style={{
            marginBottom: 24,
            padding: 16,
            background: theme.colors.card,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadow.soft
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              color: theme.colors.text,
              fontWeight: 600
            }}>
              Posts by @{filterUsername}
            </h2>
          </div>
        )}

        {/* Grid */}
        {filteredPosts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 60,
            color: theme.colors.textMuted
          }}>
            <p style={{ fontSize: 18, margin: 0 }}>No posts found.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Try a different search or check back later.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 40
          }}>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.name}
                post={post}
                onLike={() => handleLike(post.name)}
                onClick={() => setSelectedMedia(post)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetail
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </>
  );
}
