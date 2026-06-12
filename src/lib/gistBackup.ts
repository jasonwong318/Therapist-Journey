import { exportData } from './storage'

const GIST_FILENAME = 'therapy-tracker-backup.json'
const API = 'https://api.github.com/gists'

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
})

// Backs up all app data to a secret GitHub Gist.
// Returns the gist id (created on first call, reused afterwards).
export const backupToGist = async (token: string, gistId?: string): Promise<string> => {
  const content = JSON.stringify(exportData(), null, 2)
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

// Restores data from the backup gist. Returns the parsed backup object.
export const restoreFromGist = async (token: string, gistId: string): Promise<unknown> => {
  const res = await fetch(`${API}/${gistId}`, { headers: headers(token) })
  if (!res.ok) throw new Error(`GitHub error ${res.status}`)
  const json = await res.json()
  const file = json.files?.[GIST_FILENAME]
  if (!file) throw new Error('Backup file not found in gist')
  const content: string = file.truncated ? await (await fetch(file.raw_url)).text() : file.content
  return JSON.parse(content)
}

export const setLastBackup = () => localStorage.setItem('tt_last_backup', new Date().toISOString())
export const getLastBackup = (): string | null => localStorage.getItem('tt_last_backup')
