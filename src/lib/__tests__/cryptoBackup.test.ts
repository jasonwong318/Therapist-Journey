import { describe, it, expect } from 'vitest'
import { encryptJSON, decryptJSON, isEncryptedBackup } from '../cryptoBackup'

describe('cryptoBackup', () => {
  const sample = { clients: [{ id: 'c1', name: '陳小明' }], sessions: [], exportedAt: '2026-07-01' }

  it('round-trips data with the right passphrase', async () => {
    const enc = await encryptJSON(sample, 'my-secret')
    expect(isEncryptedBackup(enc)).toBe(true)
    expect(JSON.stringify(enc)).not.toContain('陳小明')
    const dec = await decryptJSON(enc, 'my-secret')
    expect(dec).toEqual(sample)
  })

  it('rejects the wrong passphrase', async () => {
    const enc = await encryptJSON(sample, 'my-secret')
    await expect(decryptJSON(enc, 'wrong')).rejects.toThrow()
  })

  it('plain backups are not mistaken for encrypted ones', () => {
    expect(isEncryptedBackup(sample)).toBe(false)
    expect(isEncryptedBackup(null)).toBe(false)
  })
})
