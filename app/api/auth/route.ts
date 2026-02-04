// @/app/api/auth/route.ts
import { NextResponse } from "next/server";
import { getDecodedToken } from "@/services/bambuLabApi";

const BASE_URL = "https://api.bambulab.com";
const LOGIN_ENDPOINT = "/v1/user-service/user/login";
const SEND_EMAIL_CODE_ENDPOINT = "/v1/user-service/user/sendemail/code";

type LoginType = "verifyCode" | "tfa";

type BambuLoginResponse = {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  loginType?: LoginType;
  tfaKey?: string;
  message?: string;
  error?: string;
  [k: string]: any;
};

function authCookieOptions(isRemember: boolean) {
  const base = {
    httpOnly: true,
    secure: false, // dev http://localhost
    sameSite: "lax" as const,
    path: "/",
  };

  return isRemember ? { ...base, maxAge: 30 * 24 * 60 * 60 } : base;
}

function pendingCookieOptions(isRemember: boolean) {
  return { ...authCookieOptions(isRemember), maxAge: 10 * 60 };
}

function makePendingValue(payload: object) {
  return JSON.stringify({ ...payload, createdAt: Date.now() });
}

export async function POST(request: Request) {
  const { email, password, isRemember } = await request.json();
  const remember = !!isRemember;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}${LOGIN_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: email, password }),
    });

    const data: BambuLoginResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: data?.message || data?.error || "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ success
    if (data.success && data.accessToken) {
      const token = data.accessToken;
      const opts = authCookieOptions(remember);

      // Decode only if JWT-like; your getDecodedToken is now tolerant, but keep this safe.
      let decodedToken: any = null;
      let username = "";
      try {
        const decoded = getDecodedToken(token);
        decodedToken = decoded.decodedToken;
        username = decoded.username;
      } catch {
        decodedToken = null;
        username = "";
      }

      const res = NextResponse.json({ ok: true });

      res.cookies.set("access_token", token, opts);
      res.cookies.set("auth", JSON.stringify(data), opts);

      // Optional: store expires_at for UI (works for opaque tokens)
      if (typeof data.expiresIn === "number" && data.expiresIn > 0) {
        const expiresAt = Date.now() + data.expiresIn * 1000;
        res.cookies.set("expires_at", String(expiresAt), {
          ...opts,
          httpOnly: false, // allow UI to read it; change to true if you don't need it client-side
        });
      }

      // Only set these if we actually got them
      if (decodedToken) res.cookies.set("token", JSON.stringify(decodedToken), opts);
      if (username) res.cookies.set("username", username, opts);

      res.cookies.delete("bambu_pending");
      return res;
    }

    // 🔐 verifyCode flow
    if (data.loginType === "verifyCode") {
      await fetch(`${BASE_URL}${SEND_EMAIL_CODE_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "codeLogin" }),
      }).catch(() => {});

      const res = NextResponse.json(
        { ok: false, stage: "verifyCode", message: "Verification code sent to your email." },
        { status: 401 }
      );

      res.cookies.set(
        "bambu_pending",
        makePendingValue({ stage: "verifyCode", email, isRemember: remember }),
        pendingCookieOptions(remember)
      );

      return res;
    }

    // 🔐 MFA flow
    if (data.loginType === "tfa" && data.tfaKey) {
      const res = NextResponse.json(
        { ok: false, stage: "tfa", message: "MFA code required." },
        { status: 401 }
      );

      res.cookies.set(
        "bambu_pending",
        makePendingValue({ stage: "tfa", tfaKey: data.tfaKey, isRemember: remember }),
        pendingCookieOptions(remember)
      );

      return res;
    }

    return NextResponse.json(
      { ok: false, error: data?.message || data?.error || "Login failed." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
