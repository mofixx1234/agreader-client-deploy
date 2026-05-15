/** Hachage déterministe côté client (démo sans backend). Pour la prod, utiliser un serveur (Argon2id, bcrypt). */
export async function hashPassword(emailNorm: string, password: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(`${emailNorm}::${password}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
