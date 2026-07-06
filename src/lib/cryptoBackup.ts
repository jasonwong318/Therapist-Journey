// Passphrase-based encryption for cloud backups (AES-GCM, PBKDF2-derived key).
// The passphrase lives in local settings so day-to-day backups stay seamless;
// restoring on a NEW device requires typing the same passphrase.

const te = new TextEncoder()
const td = new TextDecoder()

const b64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))

const deriveKey = async (passphrase: string, salt: Uint8Array): Promise<CryptoKey> => {
  const material = await crypto.subtle.importKey('raw', te.encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 150_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface EncryptedBackup {
  encrypted: true
  alg: 'AES-GCM'
  salt: string
  iv: string
  data: string
}

export const isEncryptedBackup = (x: unknown): x is EncryptedBackup =>
  typeof x === 'object' && x !== null
  && (x as EncryptedBackup).encrypted === true
  && (x as EncryptedBackup).alg === 'AES-GCM'
  && typeof (x as EncryptedBackup).data === 'string'

export const encryptJSON = async (obj: unknown, passphrase: string): Promise<EncryptedBackup> => {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    te.encode(JSON.stringify(obj)),
  )
  return { encrypted: true, alg: 'AES-GCM', salt: b64(salt), iv: b64(iv), data: b64(cipher) }
}

// Throws on wrong passphrase (AES-GCM auth failure).
export const decryptJSON = async (payload: EncryptedBackup, passphrase: string): Promise<unknown> => {
  const key = await deriveKey(passphrase, unb64(payload.salt))
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: unb64(payload.iv) as BufferSource },
    key,
    unb64(payload.data) as BufferSource,
  )
  return JSON.parse(td.decode(plain))
}
