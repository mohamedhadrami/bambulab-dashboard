import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDecodedToken } from "@/services/bambuLabApi";

const BASE_URL = "https://api.bambulab.com";
const LOGIN_ENDPOINT = "/v1/user-service/user/login";
const TFA_ENDPOINT = "/api/sign-in/tfa";

type Pending =
  | { stage: "verifyCode"; email: string; isRemember?: boolean; createdAt?: number }
  | { stage: "tfa"; tfaKey: string; isRemember?: boolean; createdAt?: number };

function safeParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function authCookieOptions(isRemember: boolean) {
  const base = {
    httpOnly: true,
    secure: false, // dev http://localhost
    sameSite: "lax" as const,
    path: "/",
  };
  return isRemember ? { ...base, maxAge: 30 * 24 * 60 * 60 } : base;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as any));
  const code = body?.code;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ ok: false, error: "Code is required." }, { status: 400 });
  }

  const pendingRaw = cookies().get("bambu_pending")?.value;
  if (!pendingRaw) {
    return NextResponse.json(
      { ok: false, error: "No pending verification session. Please login again." },
      { status: 400 }
    );
  }

  const pending = safeParse<Pending>(pendingRaw);
  if (!pending || !("stage" in pending)) {
    return NextResponse.json(
      { ok: false, error: "Invalid pending session. Please login again." },
      { status: 400 }
    );
  }

  const remember = !!pending.isRemember;
  const opts = authCookieOptions(remember);

  try {
    if (pending.stage === "verifyCode") {
      const verifyRes = await fetch(`${BASE_URL}${LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: pending.email, code }),
      });

      const raw = await verifyRes.text();
      let verifyData: any = {};
      try {
        verifyData = raw ? JSON.parse(raw) : {};
      } catch {}

      console.log("[verifyCode] status:", verifyRes.status, "raw:", raw);

      const token = verifyData?.accessToken;

      if (!verifyRes.ok || !token) {
        return NextResponse.json(
          { ok: false, error: verifyData?.message || "Invalid verification code." },
          { status: 401 }
        );
      }

      // Decode only if possible
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
      res.cookies.set("auth", JSON.stringify(verifyData), opts);

      // Optional: store expires_at for UI
      if (typeof verifyData?.expiresIn === "number" && verifyData.expiresIn > 0) {
        const expiresAt = Date.now() + verifyData.expiresIn * 1000;
        res.cookies.set("expires_at", String(expiresAt), {
          ...opts,
          httpOnly: false,
        });
      }

      if (decodedToken) res.cookies.set("token", JSON.stringify(decodedToken), opts);
      if (username) res.cookies.set("username", username, opts);

      res.cookies.delete("bambu_pending");
      return res;
    }

    if (pending.stage === "tfa") {
      const tfaRes = await fetch(`${BASE_URL}${TFA_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tfaKey: pending.tfaKey, tfaCode: code }),
      });

      const raw = await tfaRes.text();
      let tfaData: any = {};
      try {
        tfaData = raw ? JSON.parse(raw) : {};
      } catch {}

      console.log("[tfa] status:", tfaRes.status, "raw:", raw);

      const token = tfaData?.accessToken || tfaData?.token;

      if (!tfaRes.ok || !token) {
        return NextResponse.json(
          { ok: false, error: tfaData?.message || "MFA verification failed." },
          { status: 401 }
        );
      }

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
      res.cookies.set("auth", JSON.stringify(tfaData), opts);

      if (typeof tfaData?.expiresIn === "number" && tfaData.expiresIn > 0) {
        const expiresAt = Date.now() + tfaData.expiresIn * 1000;
        res.cookies.set("expires_at", String(expiresAt), {
          ...opts,
          httpOnly: false,
        });
      }

      if (decodedToken) res.cookies.set("token", JSON.stringify(decodedToken), opts);
      if (username) res.cookies.set("username", username, opts);

      res.cookies.delete("bambu_pending");
      return res;
    }

    return NextResponse.json({ ok: false, error: "Unsupported verification stage." }, { status: 400 });
  } catch (e: any) {
    console.error("VERIFY ROUTE ERROR:", e?.message || e, e?.stack);
    return NextResponse.json(
      { ok: false, error: `Verify failed (server): ${e?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}
