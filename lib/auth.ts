// Requires env var AUTH_SECRET in production to sign session tokens.
// Falls back to a dev-only default when missing.
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { readFile, writeFile } from "fs/promises"
import path from "path"

export type UserRecord = {
  id: string
  email: string
  name: string
  role: "student" | "parent" | "teacher"
  passwordHash: string
}

const USERS_FILE = path.join(process.cwd(), "lib", "data", "users.json")
const SESSION_COOKIE = "accessed_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "dev-insecure-secret-change-me"
  return new TextEncoder().encode(secret)
}

async function ensureUsersFile(): Promise<void> {
  try {
    await readFile(USERS_FILE, "utf8")
  } catch {
    await writeFile(USERS_FILE, "[]", "utf8")
  }
}

export async function loadUsers(): Promise<UserRecord[]> {
  await ensureUsersFile()
  const raw = await readFile(USERS_FILE, "utf8")
  try {
    const data = JSON.parse(raw)
    if (Array.isArray(data)) return data as UserRecord[]
    return []
  } catch {
    return []
  }
}

export async function saveUsers(users: UserRecord[]): Promise<void> {
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8")
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const users = await loadUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export async function createUser(params: { email: string; name: string; role: UserRecord["role"]; password: string }): Promise<UserRecord> {
  const users = await loadUsers()
  const exists = users.find((u) => u.email.toLowerCase() === params.email.toLowerCase())
  if (exists) throw new Error("Email already registered")
  const passwordHash = await bcrypt.hash(params.password, 10)
  const newUser: UserRecord = {
    id: crypto.randomUUID(),
    email: params.email,
    name: params.name,
    role: params.role,
    passwordHash,
  }
  users.push(newUser)
  await saveUsers(users)
  return newUser
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

export type SessionClaims = {
  sub: string
  email: string
  name: string
  role: UserRecord["role"]
}

export async function createSession(user: UserRecord): Promise<string> {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role } as Omit<SessionClaims, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret())
  return token
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" })
}

export async function getSession(): Promise<SessionClaims | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getAuthSecret())
    return {
      sub: String(payload.sub || ""),
      email: String(payload.email || ""),
      name: String(payload.name || ""),
      role: (payload.role as SessionClaims["role"]) || "student",
    }
  } catch {
    return null
  }
}

export async function requireSession(): Promise<SessionClaims> {
  const s = await getSession()
  if (!s) throw new Error("Unauthorized")
  return s
}

export async function toPublicUser(u: UserRecord | SessionClaims) {
  return { id: "id" in u ? u.id : u.sub, email: u.email, name: u.name, role: u.role }
} 