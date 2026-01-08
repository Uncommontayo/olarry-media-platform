import { theme } from "../styles/theme";

export default function PostCard({ post, onLike, onClick, showUsername = true }) {
  // Direct Azure Blob Storage URL from backend response
  const mediaUrl = post.url;
  
  const isVideo = post.name?.includes('.mp4') || post.name?.includes('.mov') || post.name?.includes('.webm');

  return (
    <article
      style={{
        background: theme.colors.card,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: theme.transition.normal,
        boxShadow: theme.shadow.soft,
        position: 'relative',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = theme.shadow.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme.shadow.soft;
      }}
    >
      {/* Media */}
      <div style={{
        position: 'relative',
        paddingBottom: '100%',
        background: theme.colors.bape,
        overflow: 'hidden'
      }}>
        {isVideo ? (
          <>
            <video
              src={mediaUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}>▶</div>
            </div>
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={post.caption || post.title || 'Media'}
            loading="lazy"
            onError={(e) => {
              console.error('Failed to load image:', mediaUrl, 'Post:', post);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: ${theme.colors.textMuted}; font-size: 14px;"><div style="font-size: 32px;">🖼️</div><div>Image not available</div><div style="font-size: 10px; max-width: 200px; word-break: break-all;">${mediaUrl?.substring(0, 50)}...</div></div>`;
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 12 }}>
        {showUsername && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: theme.colors.bape,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {post.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <a
              href={`/profile.html?user=${encodeURIComponent(post.username)}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: 14,
                color: theme.colors.text,
                fontWeight: 600,
                textDecoration: 'none',
                transition: theme.transition.fast
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.accentBright;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.text;
              }}
            >
              @{post.username}
            </a>
          </div>
        )}

        {(post.title || post.caption) && (
          <p style={{
            margin: '0 0 10px 0',
            fontSize: 14,
            lineHeight: 1.4,
            color: theme.colors.textSecondary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {post.title || post.caption}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: 12
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 16,
              color: theme.colors.textMuted,
              transition: theme.transition.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#E74C3C';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textMuted;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ❤️ <span style={{ fontSize: 13 }}>{post.likes || 0}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 16,
              color: theme.colors.textMuted,
              transition: theme.transition.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.accentBright;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textMuted;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            💬 <span style={{ fontSize: 13 }}>{post.comments || 0}</span>
          </button>
          {post.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontSize: 13 }}>
              📍 {post.location}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
