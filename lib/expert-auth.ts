import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { getSupabaseAdminClient } from "@/lib/supabase-server";

const SESSION_COOKIE_NAME = "sipadi_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 2;

export type DashboardUserRole = "pakar" | "admin";

interface DashboardCredentialRecord {
  role: DashboardUserRole;
  username: string;
  password: string;
}

interface DashboardUserRow {
  username: string;
  role: DashboardUserRole;
  password_hash: string;
  is_active: boolean;
}

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
  ] satisfies DashboardCredentialRecord[];
}

export function hashDashboardPassword(password: string, salt?: string) {
  const resolvedSalt = salt ?? randomBytes(16).toString("base64url");
  const hash = scryptSync(password, resolvedSalt, 64).toString("base64url");
  return `scrypt$${resolvedSalt}$${hash}`;
}

function verifyDashboardPasswordHash(password: string, passwordHash: string) {
  const [algorithm, salt, hash] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expectedHash = scryptSync(password, salt, 64);
  const actualHash = Buffer.from(hash, "base64url");

  if (expectedHash.length !== actualHash.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, actualHash);
}

function authenticateWithFallbackCredentials(username: string, password: string) {
  return (
    getDashboardCredentials().find(
      (credential) =>
        credential.username === username && credential.password === password
    ) ?? null
  );
}

export async function authenticateDashboardUser(
  username: string,
  password: string
) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("dashboard_users")
      .select("username, role, password_hash, is_active")
      .eq("username", username)
      .eq("is_active", true)
      .maybeSingle<DashboardUserRow>();

    if (error) {
      throw new Error(error.message);
    }

    if (data && verifyDashboardPasswordHash(password, data.password_hash)) {
      return {
        username: data.username,
        role: data.role,
      };
    }
  }

  return authenticateWithFallbackCredentials(username, password);
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
