import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/auth/verify-token
 *
 * Purpose:
 * 1) Verify Google ID token with Google's OAuth tokeninfo API.
 * 2) Create and return app session data only after successful verification.
 *
 * Request body:
 * {
 *   "idToken": "<google-id-token>"
 * }
 *
 * Success response (200):
 * {
 *   "token": "<app-jwt>",
 *   "user": { ... },
 *   "verified": true,
 *   "google": {
 *     "sub": "...",
 *     "email": "...",
 *     "name": "...",
 *     "picture": "...",
 *     "iss": "...",
 *     "email_verified": "true"
 *   }
 * }
 *
 * Error responses:
 * - 400: Invalid request body or missing idToken.
 * - 401: Invalid/expired token or audience mismatch.
 * - 502: Upstream verification/session creation failure.
 */

type VerifyTokenRequest = {
  idToken?: string;
};

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  exp?: string;
  iss?: string;
  email_verified?: string;
};

const GOOGLE_TOKEN_INFO_ENDPOINT = "https://oauth2.googleapis.com/tokeninfo";
const APP_AUTH_BASE_URL =
  process.env.SHOUTLY_API_BASE_URL || "https://backend.shoutlyai.com";

const isExpired = (exp?: string) => {
  if (!exp) return true;
  const expSeconds = Number(exp);
  if (!Number.isFinite(expSeconds)) return true;
  return Date.now() >= expSeconds * 1000;
};

export async function POST(request: Request) {
  let body: VerifyTokenRequest;
  try {
    body = (await request.json()) as VerifyTokenRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const idToken = typeof body?.idToken === "string" ? body.idToken.trim() : "";
  if (!idToken) {
    return NextResponse.json({ message: "idToken is required." }, { status: 400 });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  let googleTokenInfo: GoogleTokenInfo;
  try {
    const verifyResponse = await fetch(
      `${GOOGLE_TOKEN_INFO_ENDPOINT}?id_token=${encodeURIComponent(idToken)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    );

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { message: "Invalid or expired Google token." },
        { status: 401 }
      );
    }

    googleTokenInfo = (await verifyResponse.json()) as GoogleTokenInfo;
  } catch {
    return NextResponse.json(
      { message: "Failed to verify token with Google." },
      { status: 502 }
    );
  }

  if (!googleTokenInfo?.sub || isExpired(googleTokenInfo.exp)) {
    return NextResponse.json(
      { message: "Invalid or expired Google token." },
      { status: 401 }
    );
  }

  if (googleClientId && googleTokenInfo.aud !== googleClientId) {
    return NextResponse.json(
      { message: "Google token audience mismatch." },
      { status: 401 }
    );
  }

  try {
    const sessionResponse = await fetch(`${APP_AUTH_BASE_URL}/api/auth/google/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    });

    const text = await sessionResponse.text().catch(() => "");
    let payload: Record<string, unknown> = {};
    try {
      payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      payload = { message: text };
    }

    if (!sessionResponse.ok) {
      const message =
        typeof payload?.message === "string"
          ? payload.message
          : "Failed to create user session.";
      return NextResponse.json({ message }, { status: sessionResponse.status });
    }

    return NextResponse.json(
      {
        ...payload,
        verified: true,
        google: {
          sub: googleTokenInfo.sub,
          email: googleTokenInfo.email,
          name: googleTokenInfo.name,
          picture: googleTokenInfo.picture,
          iss: googleTokenInfo.iss,
          email_verified: googleTokenInfo.email_verified,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Token verified but session creation failed." },
      { status: 502 }
    );
  }
}
