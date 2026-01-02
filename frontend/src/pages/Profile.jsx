import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { uploadPostWithProgress, deletePost } from "../api";

const API_BASE =
  "https://larry-media-api-axh2emfhfxf3gxaa.germanywestcentral-01.azurewebsites.net/api";

export default function Profile() {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  // avatar upload UX state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState("");
  const [cropToSquare, setCropToSquare] = useState(true);

  useEffect(() => {
    // create or revoke preview URLs when selectedFile changes
    if (selectedFile) {
      const u = URL.createObjectURL(selectedFile);
      setPreviewUrl(u);
    } else {
      setPreviewUrl("");
    }
    return () => { if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(""); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  // regenerate cropped preview whenever selection or crop toggle changes
  useEffect(() => {
    let mounted = true;
    let curUrl = '';

    (async () => {
      if (selectedFile && cropToSquare) {
        try {
          const blob = await getCroppedBlob(selectedFile);
          if (!mounted) return;
          curUrl = URL.createObjectURL(blob);
          setCroppedPreviewUrl(curUrl);
        } catch (err) {
          console.error('crop preview failed', err);
          setCroppedPreviewUrl('');
        }
      } else {
        setCroppedPreviewUrl('');
      }
    })();

    return () => { mounted = false; if (curUrl) { URL.revokeObjectURL(curUrl); } };
  }, [selectedFile, cropToSquare]);

  const currentUsername = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';

  // stable loader for use in effects
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_media`);
      const data = await res.json();

      // find profile picture posts (caption === '__profile_pic__') — latest first
      let pp = data.find((p) => p.username === username && p.caption === '__profile_pic__');
      setProfilePic(pp?.url || "");

      const userPosts = data.filter((p) => p.username === username && p.caption !== '__profile_pic__');
      setPosts(userPosts);
    } catch (err) {
      console.error("fetchProfilePosts failed:", err);
      setPosts([]);
      setProfilePic("");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { load(); }, [load]);

  // helper: center-square crop using canvas
  async function getCroppedBlob(inputFile) {
    if (!inputFile) return inputFile;
    const img = await new Promise((res, rej) => {
      const i = new Image();
      const objUrl = URL.createObjectURL(inputFile);
      i.onload = () => { URL.revokeObjectURL(objUrl); res(i); };
      i.onerror = () => { URL.revokeObjectURL(objUrl); rej(new Error('image load error')); };
      i.src = objUrl;
    });

    const size = Math.min(img.width, img.height);
    const sx = Math.floor((img.width - size) / 2);
    const sy = Math.floor((img.height - size) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

    return await new Promise((res) => canvas.toBlob(res, inputFile.type || 'image/jpeg'));
  }

  // when user selects a file in the profile UI
  async function handleFileSelect(file) {
    if (!file) return;
    setSelectedFile(file);
    setStatus('Previewing...');
    // if crop preview is enabled, create a cropped preview URL
    if (cropToSquare) {
      try {
        const blob = await getCroppedBlob(file);
        const u = URL.createObjectURL(blob);
        setCroppedPreviewUrl(u);
      } catch (err) {
        console.error('crop preview failed', err);
        setCroppedPreviewUrl('');
      }
    } else {
      setCroppedPreviewUrl('');
    }
    setTimeout(() => setStatus(''), 800);
  }

  // delete other profile images for this user (keeps the specified keepName if provided)
  async function deleteOldProfilePics(keepName) {
    try {
      const res = await fetch(`${API_BASE}/list_media`);
      const data = await res.json();
      const oldPics = data.filter((p) => p.username === username && p.caption === '__profile_pic__' && p.name !== keepName);
      await Promise.allSettled(oldPics.map((p) => deletePost(p.name).catch((e) => console.error('delete failed', e))));
    } catch (err) {
      console.error('deleteOldProfilePics failed', err);
    }
  }

  // Upload the selected file (or the raw selectedFile) and remove old profile images after success
  async function handleProfileUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setStatus("Uploading profile picture...");
    setProgress(0);

    try {
      const fileToSend = cropToSquare ? await getCroppedBlob(selectedFile) : selectedFile;

      const { promise } = uploadPostWithProgress(fileToSend, "__profile_pic__", username || "anonymous", (p) => setProgress(p));
      const newName = await promise; // server returns a text identifier (name)
      setStatus("Uploaded");

      // remove previous profile pictures (keep the newly uploaded one if server returned a name)
      await deleteOldProfilePics(newName || null);

      // clear selection and reload profile
      setSelectedFile(null);
      setCroppedPreviewUrl('');
      await load();
    } catch (err) {
      console.error("upload profile failed:", err);
      setStatus("Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setStatus(''), 2200);
    }
  }

  return (
    <main style={styles.page}>
      {/* PROFILE HEADER */}
      <div style={styles.header}>
        <div style={{ ...styles.avatar, overflow: 'hidden' }}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{username[0]?.toUpperCase()}</div>
          )}
        </div>

        <div>
          <h2>@{username}</h2>
          <p>{posts.length} posts</p>

          {currentUsername === username && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files && e.target.files[0])} disabled={uploading} />
                <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={cropToSquare} onChange={(e) => setCropToSquare(e.target.checked)} disabled={uploading} />
                  <small>Crop to square</small>
                </label>
              </div>

              {previewUrl && (
                <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12 }}>Original</div>
                    <img src={previewUrl} alt="original preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} />
                  </div>

                  {cropToSquare && croppedPreviewUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12 }}>Cropped</div>
                      <img src={croppedPreviewUrl} alt="cropped preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} />
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={handleProfileUpload} disabled={uploading || !selectedFile} style={{ padding: '8px 12px' }}>{uploading ? `Uploading… (${progress}%)` : 'Upload'}</button>
                <button onClick={() => { setSelectedFile(null); setCroppedPreviewUrl(''); setStatus(''); }} disabled={uploading} style={{ padding: '8px 12px' }}>Cancel</button>
              </div>

              {status && <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{status}</div>}
            </div>
          )}
        </div>
      </div>

      {/* POSTS */}
      {loading && <p>Loading profile…</p>}

      <div style={styles.grid}>
        {posts.map((post) => (
          <img
            key={post.name}
            src={post.url}
            alt=""
            style={styles.image}
          />
        ))}
      </div>
    </main>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
  },
  header: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "30px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    fontSize: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
  },
  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "10px",
  },
};
