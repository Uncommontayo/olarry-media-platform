// src/api.js — API service with authentication support
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Auth helpers
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

export function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('username');
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function getUserRole() {
  return localStorage.getItem('userRole');
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function checkResJson(res) {
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login.html';
    throw new Error('Authentication required');
  }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Authentication
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await checkResJson(res);
  if (data.token) {
    setAuthToken(data.token);
    localStorage.setItem('userRole', data.role || 'consumer');
    localStorage.setItem('username', username);
  }
  return data;
}

export async function register(username, password, role = 'consumer') {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  return checkResJson(res);
}

// Media operations
export async function fetchFeed() {
  const res = await fetch(`${API_BASE}/list_media`, {
    headers: getAuthHeaders()
  });
  return checkResJson(res);
}

export async function searchMedia(query) {
  const res = await fetch(`${API_BASE}/search_media?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders()
  });
  return checkResJson(res);
}

export async function uploadPost(file, caption = "", username = "anonymous") {
  const params = new URLSearchParams({ caption: caption || "", username: username || "anonymous" }).toString();
  const res = await fetch(`${API_BASE}/upload_media?${params}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: file,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.text();
}

export function uploadPostWithProgress(file, caption = "", username = "anonymous", onProgress) {
  const params = new URLSearchParams({ caption: caption || "", username: username || "anonymous" }).toString();
  const url = `${API_BASE}/upload_media?${params}`;
  let xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    xhr.open("POST", url);
    xhr.responseType = "text";
    
    const token = getAuthToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

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
    try { xhr.send(file); } catch (sendErr) { reject(sendErr); }
  });

  return {
    promise,
    abort: () => { try { xhr.abort(); } catch (e) { console.debug('xhr abort error', e); } },
  };
}

export async function likePost(name) {
  const res = await fetch(`${API_BASE}/like_media?name=${encodeURIComponent(name)}`, { 
    method: "POST",
    headers: getAuthHeaders()
  });
  return checkResJson(res);
}

export async function deletePost(name) {
  const res = await fetch(`${API_BASE}/delete_media?name=${encodeURIComponent(name)}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `${res.status} ${res.statusText}`);
  }
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
  const res = await fetch(`${API_BASE}/ai_caption?name=${encodeURIComponent(name)}`, {
    headers: getAuthHeaders()
  });
  return checkResJson(res);
}

// Comments
export async function getComments(mediaName) {
  const res = await fetch(`${API_BASE}/get_comments?media_name=${encodeURIComponent(mediaName)}`, {
    headers: getAuthHeaders()
  });
  return checkResJson(res);
}

export async function addComment(mediaName, comment, parentId = null) {
  const res = await fetch(`${API_BASE}/add_comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      media_name: mediaName,
      comment,
      parent_id: parentId
    })
  });
  return checkResJson(res);
}
