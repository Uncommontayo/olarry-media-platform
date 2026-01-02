import { useState, useRef, useEffect } from "react";
import { uploadPostWithProgress, uploadPost } from "../api";

export default function Upload({ onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [username, setUsername] = useState(() => localStorage.getItem('username') || "");

  useEffect(() => {
    try { localStorage.setItem('username', username || ''); } catch (e) { console.debug('localStorage setItem failed', e); }
  }, [username]);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cropToSquare, setCropToSquare] = useState(false);

  const abortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Handle file input change or drop
  function handleFileChange(e) {
    const f = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!f) return;

    setFile(f);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setPreview(URL.createObjectURL(f));
  }

  // Drag & drop handlers
  function handleDrop(e) {
    e.preventDefault();
    handleFileChange(e);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  // Simple center-square crop using canvas; returns a Blob
  async function getCroppedBlob(inputFile) {
    if (!inputFile) return inputFile;
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = URL.createObjectURL(inputFile);
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

  // Client-side AI caption suggestion (heuristic)
  function generateClientAICaption() {
    if (!file) {
      setCaption('A moment worth sharing.');
      return;
    }

    const baseName = (file.name || 'moment').split('.')[0].replace(/[-_]/g, ' ');
    const date = new Date().toISOString().slice(0,10);
    setCaption(`A moment captured by @${username || 'someone'}. ${baseName} — shared on ${date}.`);
  }
  async function handleUpload() {
    if (!file) {
      setStatus("Please select an image");
      return;
    }

    setStatus("Preparing upload...");
    setIsUploading(true);
    setProgress(0);

    try {
      // apply simple square crop if requested
      const fileToSend = cropToSquare ? await getCroppedBlob(file) : file;

      // Attempt XHR upload with progress first
      try {
        const { promise, abort } = uploadPostWithProgress(fileToSend, caption, username || "anonymous", (p) => setProgress(p));
        abortRef.current = abort;
        await promise;
      } catch (xhrErr) {
        console.warn('XHR upload failed, attempting fetch fallback:', xhrErr);
        setStatus('Upload via XHR failed, retrying...');
        // try the fetch-based upload as a fallback
        try {
          await uploadPost(fileToSend, caption, username || "anonymous");
        } catch (fetchErr) {
          // surface the original xhr error alongside the fetch error for debugging
          console.error('Fallback fetch upload also failed:', fetchErr);
          throw xhrErr || fetchErr;
        }
      }

      setStatus("Uploaded successfully");
      setFile(null);
      if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
      setCaption("");

      onDone?.(); // return to feed
    } catch (err) {
      console.error("uploadPost failed:", err);
      setStatus(err?.message || "Upload failed — check console");
    } finally {
      setIsUploading(false);
      setProgress(0);
      abortRef.current = null;
    }
  }

  function handleCancel() {
    if (abortRef.current) {
      abortRef.current();
      setStatus("Upload cancelled");
      setIsUploading(false);
      setProgress(0);
      abortRef.current = null;
    }
  }

  return (
    <section className="upload-shell" aria-label="Upload media">
      <div className="upload-card">
        <div className="upload-head">
          <div>
            <p className="eyebrow">Studio</p>
            <h2>Launch a new drop</h2>
            <p className="muted">Futuristic matte vibe with crisp previews.</p>
          </div>
          <span className="badge">Beta</span>
        </div>

        <div
          className="upload-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="drop-inner">
            <p>Drag & drop your visual</p>
            <p className="muted">or choose a file to beam it up</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>

        {preview && (
          <div className="upload-preview">
            <img src={preview} alt="preview" />
            <div className="preview-glow" />
          </div>
        )}

        <div className="input-row">
          <input
            className="field"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isUploading}
          />

          <label className="toggle">
            <input type="checkbox" checked={cropToSquare} onChange={(e) => setCropToSquare(e.target.checked)} disabled={isUploading} />
            <span>Crop to square</span>
          </label>
        </div>

        <textarea
          className="field"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={isUploading}
        />

        <div className="action-row">
          <button className="pill" onClick={generateClientAICaption} disabled={isUploading || !file}>Auto-generate caption</button>
          <button className="pill pill-ghost" onClick={() => setCaption('')} disabled={isUploading || !caption}>Clear</button>
        </div>

        {isUploading && (
          <div className="progress-block">
            <div className="progress-bar" aria-label="Upload progress">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-meta">{progress}% • hold tight</div>
            <button className="pill pill-ghost" onClick={handleCancel}>Cancel</button>
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={isUploading || !file}
        >
          {isUploading ? `Uploading… (${progress}%)` : 'Upload'}
        </button>

        <p className="status-text">{status}</p>
      </div>
    </section>
  );
}
