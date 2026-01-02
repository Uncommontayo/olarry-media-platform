export default function PostCard({ post, profileUrl, onLike, onDelete }) {

  return (
    <article className="post-card" aria-label={post.caption || `Post by ${post.username}`}>
      <div className="post-media" aria-hidden>
        <span className="post-glow" />
        <img src={post.url} alt={post.caption || "uploaded image"} />
      </div>

      <div className="post-body">
        <div className="post-top">
          {profileUrl ? (
            <img className="avatar-img" src={profileUrl} alt={`${post.username} avatar`} />
          ) : (
            <div className="avatar-fallback">{post.username[0]?.toUpperCase()}</div>
          )}
          <div className="post-meta">
            <strong className="username">@{post.username}</strong>
            <span className="meta-micro">Orbit feed</span>
          </div>
        </div>

        <p className="caption">{post.caption}</p>

        <div className="post-actions">
          <button className="chip chip-like" onClick={onLike} aria-label="Like this post">❤️ {post.likes}</button>
          <button className="chip" onClick={onDelete} aria-label="Delete this post">🗑 Delete</button>
        </div>
      </div>
    </article>
  );
}
