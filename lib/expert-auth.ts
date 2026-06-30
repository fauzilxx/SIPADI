import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "sipadi_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 2;

export type DashboardUserRole = "pakar" | "admin";

function getSessionSecret() {
  return process.env.SIPADI_SESSION_SECRET || "sipadi-dev-secret";
}

export function getDashboardCredentials() {
  return [
    {
      role: "pakar" as const,
      username: process.env.SIPADI_EXPERT_USERNAME || "pakar",
      password: process.env.SIPADI_EXPERT_PASSWORD || "padihebat123",
    },
    {
      role: "admin" as const,
      username: process.env.SIPADI_ADMIN_USERNAME || "admin",
      password: process.env.SIPADI_ADMIN_PASSWORD || "adminhebat123",
    },
  ];
}

export function authenticateDashboardUser(username: string, password: string) {
  return (
    getDashboardCredentials().find(
      (credential) =>
        credential.username === username && credential.password === password
    ) ?? null
  );
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(
  username: string,
  role: DashboardUserRole
) {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = `${username}:${role}:${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  const [username, role, expiresAtRaw] = payload.split(":");
  const expiresAt = Number(expiresAtRaw);

  if (
    !username ||
    (role !== "pakar" && role !== "admin") ||
    Number.isNaN(expiresAt) ||
    expiresAt < Date.now()
  ) {
    return null;
  }

  return {
    username,
    role: role as DashboardUserRole,
    expiresAt,
  };
}

export function hasDashboardRole(
  session: { role: DashboardUserRole } | null,
  role: DashboardUserRole
) {
  return session?.role === role;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionDurationSeconds() {
  return SESSION_DURATION_SECONDS;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}
