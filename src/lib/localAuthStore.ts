import type { AuthSession, StoredUserRecord } from '../types/auth'

const USERS_KEY = 'flipbook_auth_users'
const SESSION_KEY = 'flipbook_auth_session'

function readUsers(): Record<string, StoredUserRecord> {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, StoredUserRecord>
  } catch {
    return {}
  }
}

function writeUsers(users: Record<string, StoredUserRecord>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function getStoredUser(emailNorm: string): StoredUserRecord | undefined {
  return readUsers()[emailNorm]
}

export function saveStoredUser(record: StoredUserRecord) {
  const users = readUsers()
  users[record.emailNorm] = record
  writeUsers(users)
}

export function updateStoredDisplayName(emailNorm: string, displayName: string) {
  const users = readUsers()
  const u = users[emailNorm]
  if (!u) return false
  users[emailNorm] = { ...u, displayName: displayName.trim() }
  writeUsers(users)
  return true
}

export function readSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as AuthSession
    if (!s?.token || !s?.email || typeof s.displayName !== 'string') return null
    const u = getStoredUser(normalizeEmail(s.email))
    if (!u) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    const session: AuthSession = {
      email: u.emailNorm,
      displayName: u.displayName,
      token: s.token,
    }
    writeSession(session)
    return session
  } catch {
    return null
  }
}

export function writeSession(session: AuthSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function createSessionToken(): string {
  return crypto.randomUUID()
}
