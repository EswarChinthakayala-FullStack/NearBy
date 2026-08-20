export interface JwtPayload {
  sub?: string
  exp?: number
  type?: string
  role?: string
  [key: string]: unknown
}

/**
 * Decodes a base64url encoded JWT payload safely
 */
export function decodeJwtToken(token: string): JwtPayload | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decodedJson = atob(payloadBase64)
    return JSON.parse(decodedJson) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Checks if a JWT token is expired (or close to expiring within threshold seconds)
 */
export function isTokenExpired(token: string, thresholdSeconds = 10): boolean {
  const payload = decodeJwtToken(token)
  if (!payload || !payload.exp) return true
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp - currentTime <= thresholdSeconds
}
