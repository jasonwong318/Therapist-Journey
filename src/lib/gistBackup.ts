import { exportData } from './storage'
import { encryptJSON, decryptJSON, isEncryptedBackup } from './cryptoBackup'

const GIST_FILENAME = 'therapy-tracker-backup.json'
const API = 'https://api.github.com/gists'

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
})

// Backs up all app data to a secret GitHub Gist. When a passphrase is given,
// the content is AES-GCM encrypted first. Returns the gist id (created on
// first call, reused afterwards).
export const backupToGist = async (token: string, gistId?: string, passphrase?: string): Promise<string> => {
  const payload = passphrase ? await encryptJSON(exportData(), passphrase) : exportData()
  const content = JSON.stringify(payload, null, 2)
  const body = {
    description: `Therapy Tracker backup — ${new Date().toISOString()}`,
    files: { [GIST_FILENAME]: { content } },
  }

  if (gistId) {
    const res = await fetch(`${API}/${gistId}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) })
    if (res.ok) return gistId
    // Gist may have been deleted — fall through and create a new one
    if (res.status !== 404) throw new Error(`GitHub error ${res.status}`)
  }

  const res = await fetch(API, { method: 'POST', headers: headers(token), body: JSON.stringify({ ...body, public: false }) })
  if (!res.ok) throw new Error(`GitHub error ${res.status}`)
  const json = await res.json()
  return json.id as string
}

export class BackupDecryptError extends Error {}
export class BackupNeedsPassphraseError extends Error {}

// Fetches the backup (optionally a specific past revision) and decrypts it if
// needed. Throws BackupNeedsPassphraseError / BackupDecryptError so the UI can
// prompt for the right passphrase.
export const restoreFromGist = async (token: string, gistId: string, opts?: { passphrase?: string; revision?: string }): Promise<unknown> => {
  const url = opts?.revision ? `${API}/${gistId}/${opts.revision}` : `${API}/${gistId}`
  const res = await fetch(url, { headers: headers(token) })
  if (!res.ok) throw new Error(`GitHub error ${res.status}`)
  const json = await res.json()
  const file = json.files?.[GIST_FILENAME]
  if (!file) throw new Error('Backup file not found in gist')
  const content: string = file.truncated ? await (await fetch(file.raw_url)).text() : file.content
  const parsed = JSON.parse(content)
  if (isEncryptedBackup(parsed)) {
    if (!opts?.passphrase) throw new BackupNeedsPassphraseError()
    try {
      return await decryptJSON(parsed, opts.passphrase)
    } catch {
      throw new BackupDecryptError()
    }
  }
  return parsed
}

export interface GistRevision {
  version: string
  committedAt: string
}

// Recent backup restore points (gist revision history), newest first.
export const listGistRevisions = async (token: string, gistId: string, limit = 10): Promise<GistRevision[]> => {
  const res = await fetch(`${API}/${gistId}/commits?per_page=${limit}`, { headers: headers(token) })
  if (!res.ok) throw new Error(`GitHub error ${res.status}`)
  const json = await res.json() as { version: string; committed_at: string }[]
  return json.map(c => ({ version: c.version, committedAt: c.committed_at }))
}

export const setLastBackup = () => localStorage.setItem('tt_last_backup', new Date().toISOString())
export const getLastBackup = (): string | null => localStorage.getItem('tt_last_backup')
