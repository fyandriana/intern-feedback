// src/api.js
const API_BASE = import.meta.env.VITE_API_BASE || ""; // fallback to same origin


export async function createFeedback(payload) {
    const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
    }
    return res.json();
}


export async function listFeedback({ limit = 50 } = {}) {
    const url = new URL(`${API_BASE}/api/feedback`, window.location.origin);
// only append if API_BASE is relative; otherwise construct directly
    const target = API_BASE ? `${API_BASE}/api/feedback?limit=${limit}` : `${url.pathname}?limit=${limit}`;
    const res = await fetch(target);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
    }
    return res.json();
}
