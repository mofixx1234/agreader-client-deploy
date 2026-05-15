export function validatePasswordForRegister(password: string): string | null {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.'
  }
  if (!/[A-Za-z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une lettre.'
  }
  if (!/[0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre.'
  }
  return null
}
