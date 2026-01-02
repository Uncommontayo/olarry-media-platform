// src/api.js — locked API contract for frontend → backend
// Exports:
//   fetchFeed()
//   uploadPost(file, caption, username) // sends RAW file body as required by server
//   likePost(name)
//   deletePost(name)
//   generateAICaption(name)

// API base selection:
// - Prefer VITE_API_BASE when explicitly provided (bypasses proxies).
// - Otherwise default to "/api" so Vite dev proxy and Vercel rewrites handle routing.
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function checkResJson(res) {
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchFeed() {
  const res = await fetch(`${API_BASE}/list_media`);
  return checkResJson(res);
}

export async function uploadPost(file, caption = "", username = "anonymous") {
  // Backend expects raw file in body and caption/username as query params
  const params = new URLSearchParams({ caption: caption || "", username: username || "anonymous" }).toString();

  const res = await fetch(`${API_BASE}/upload_media?${params}`, {
    method: "POST",
    body: file, // RAW FILE ONLY — do NOT set Content-Type or use FormData
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.text();
}

// Upload with progress support using XMLHttpRequest. Returns an object { promise, abort }
export function uploadPostWithProgress(file, caption = "", username = "anonymous", onProgress) {
  const params = new URLSearchParams({ caption: caption || "", username: username || "anonymous" }).toString();
  const url = `${API_BASE}/upload_media?${params}`;

  let xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    xhr.open("POST", url);
    xhr.responseType = "text";

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(xhr.responseText || `${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    try {
      xhr.send(file);
    } catch (sendErr) {
      reject(sendErr);
    }
  });

  return {
    promise,
    abort: () => {
      try { xhr.abort(); } catch (e) { console.debug('xhr abort error', e); }
    },
  };
}

export async function likePost(name) {
  const res = await fetch(`${API_BASE}/like_media?name=${encodeURIComponent(name)}`, { method: "POST" });
  return checkResJson(res); // expects { likes: number }
}

export async function deletePost(name) {
  const res = await fetch(`${API_BASE}/delete_media?name=${encodeURIComponent(name)}`, { method: "DELETE" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `${res.status} ${res.statusText}`);
  }

  // Some delete endpoints return JSON, some return plain text or empty body.
  try {
    return await res.json();
  } catch {
    try {
      const text = await res.text();
      return text || null;
    } catch {
      return null;
    }
  }
}

export async function generateAICaption(name) {
  const res = await fetch(`${API_BASE}/ai_caption?name=${encodeURIComponent(name)}`);
  return checkResJson(res); // expects { caption: "..." }
}
