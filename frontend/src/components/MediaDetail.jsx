import { useEffect, useState, useCallback } from "react";
import { getComments, addComment, likePost } from "../api";
import { theme } from "../styles/theme";

export default function MediaDetail({ media, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(media.likes || 0);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getComments(media.name);
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load comments:", e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [media.name]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleAddComment() {
    if (!newComment.trim()) return;
    try {
      await addComment(media.name, newComment, replyTo);
      setNewComment("");
      setReplyTo(null);
      await loadComments();
    } catch (e) {
      console.error("Failed to add comment:", e);
      alert("Failed to add comment. Please try again.");
    }
  }

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikeCount(prev => prev + 1);
    try {
      const result = await likePost(media.name);
      if (result.likes !== undefined) {
        setLikeCount(result.likes);
      }
    } catch (e) {
      console.error("Failed to like:", e);
      setLiked(false);
      setLikeCount(prev => prev - 1);
    }
  }

  // Build comment tree
  const commentMap = {};
  const rootComments = [];
  
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });
  
  comments.forEach(comment => {
    if (comment.parent_id) {
      if (commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      }
    } else {
      rootComments.push(commentMap[comment.id]);
    }
  });

  function CommentItem({ comment, depth = 0 }) {
    const timestamp = comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : "";
    
    return (
      <div style={{ marginLeft: depth > 0 ? 24 : 0, marginBottom: 12 }}>
        <div style={{
          background: theme.colors.card,
          padding: 12,
          borderRadius: theme.radius.sm,
          borderLeft: depth > 0 ? `3px solid ${theme.colors.accentBright}` : 'none'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: theme.colors.bape,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {comment.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <strong style={{ fontSize: 14, color: theme.colors.text }}>@{comment.username}</strong>
            <span style={{ fontSize: 12, color: theme.colors.textMuted }}>{timestamp}</span>
          </div>
          <p style={{ margin: '8px 0', fontSize: 14, lineHeight: 1.5, color: theme.colors.text }}>
            {comment.comment}
          </p>
          <button
            onClick={() => setReplyTo(comment.id)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.accentBright,
              fontSize: 12,
              cursor: 'pointer',
              padding: 0,
              fontWeight: 500
            }}
          >
            Reply
          </button>
        </div>
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  }

  // Direct Azure Blob Storage URL from backend response
  const mediaUrl = media.url;
  
  const isVideo = media.name?.includes('.mp4') || media.name?.includes('.mov') || media.name?.includes('.webm');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.colors.backgroundDark,
          borderRadius: theme.radius.lg,
          maxWidth: 1200,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          overflow: 'hidden',
          boxShadow: theme.shadow.hover
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Media Section */}
        <div style={{
          flex: '1 1 60%',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={media.caption || media.title}
              onError={(e) => {
                console.error('Failed to load image in modal:', mediaUrl);
                e.target.src = '';
                e.target.alt = 'Image failed to load';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </div>

        {/* Details Section */}
        <div style={{
          flex: '1 1 40%',
          display: 'flex',
          flexDirection: 'column',
          background: theme.colors.background,
          maxWidth: 450
        }}>
          {/* Header */}
          <div style={{
            padding: 16,
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: theme.colors.bape,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold'
              }}>
                {media.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 16, color: theme.colors.text }}>
                  @{media.username}
                </strong>
                {media.location && (
                  <span style={{ fontSize: 12, color: theme.colors.textMuted }}>
                    📍 {media.location}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: theme.colors.text,
                padding: 8
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Title & Caption */}
          <div style={{ padding: 16, borderBottom: `1px solid ${theme.colors.border}` }}>
            {media.title && (
              <h2 style={{ margin: '0 0 8px 0', fontSize: 20, color: theme.colors.text }}>
                {media.title}
              </h2>
            )}
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: theme.colors.textSecondary }}>
              {media.caption || media.title || "No caption"}
            </p>
            {media.tagged_people && media.tagged_people.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {media.tagged_people.map((person, i) => (
                  <span
                    key={i}
                    style={{
                      background: theme.colors.accentBright,
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: theme.radius.xs,
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    @{person}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            padding: 16,
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            gap: 16
          }}>
            <button
              onClick={handleLike}
              disabled={liked}
              style={{
                background: liked ? theme.colors.error : theme.colors.card,
                color: liked ? '#fff' : theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                padding: '8px 16px',
                borderRadius: theme.radius.sm,
                cursor: liked ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: theme.transition.fast
              }}
            >
              ❤️ {likeCount}
            </button>
            <div style={{
              padding: '8px 16px',
              background: theme.colors.card,
              borderRadius: theme.radius.sm,
              fontSize: 14,
              color: theme.colors.textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              💬 {comments.length}
            </div>
          </div>

          {/* Comments */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: theme.colors.textMuted }}>Loading comments...</p>
            ) : rootComments.length === 0 ? (
              <p style={{ textAlign: 'center', color: theme.colors.textMuted }}>No comments yet. Be the first!</p>
            ) : (
              rootComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>

          {/* Add Comment */}
          <div style={{
            padding: 16,
            borderTop: `1px solid ${theme.colors.border}`,
            background: theme.colors.card
          }}>
            {replyTo && (
              <div style={{
                marginBottom: 8,
                padding: 8,
                background: theme.colors.background,
                borderRadius: theme.radius.xs,
                fontSize: 12,
                color: theme.colors.textSecondary,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Replying to comment...</span>
                <button
                  onClick={() => setReplyTo(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.error,
                    padding: 0,
                    fontSize: 16
                  }}
                >
                  ×
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: theme.radius.sm,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: 14,
                  resize: 'none',
                  height: 60,
                  fontFamily: 'inherit',
                  background: theme.colors.background
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  padding: '0 20px',
                  borderRadius: theme.radius.sm,
                  border: 'none',
                  background: newComment.trim() ? theme.colors.accentBright : theme.colors.border,
                  color: '#fff',
                  cursor: newComment.trim() ? 'pointer' : 'default',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: theme.transition.fast
                }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
