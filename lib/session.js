// Signed session cookie, issued by the server after a successful OTP check.
//
// The cookie is httpOnly (page scripts cannot read or forge it) and signed
// with HMAC-SHA256, so the server can trust the mobile number inside it.
// Uses Web Crypto so the same code works in middleware (edge) and in
// route handlers / server components (node).
//
// Required env var: SESSION_SECRET (a long random string, e.g. `openssl rand -hex 32`)

export const SESSION_COOKIE = "gigsar_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (at least 32 characters)");
  }
  // Local development only.
  return "dev-only-session-secret-change-me-please-0000";
}

function toBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "===".slice((b64.length + 3) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(data) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// `app` ("artist" | "user") stops a cookie from one portal being used on the other.
export async function createSessionToken(mobile, app) {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({ m: String(mobile), a: app, e: Date.now() + SESSION_MAX_AGE * 1000 })
    )
  );
  return `${payload}.${await hmac(payload)}`;
}

// Returns { mobile } for a valid, unexpired token, otherwise null.
export async function readSessionToken(token, app) {
  try {
    if (!token || typeof token !== "string") return null;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    if (!safeEqual(sig, await hmac(payload))) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (data.a !== app || !data.m || Date.now() > data.e) return null;
    return { mobile: data.m };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

// For route handlers and middleware: reads the session from the request cookie.
export async function getRequestSession(req, app) {
  return readSessionToken(req.cookies.get(SESSION_COOKIE)?.value, app);
}
