export type AuthUser = {
  email: string
  displayName: string
}

export type AuthSession = AuthUser & {
  token: string
}

export type StoredUserRecord = {
  emailNorm: string
  displayName: string
  passwordHash: string
  createdAt: string
}
