// Optional PIN lock. Stores only a salted SHA-256 hash — the PIN itself never
// touches storage. This is casual privacy (client names on a shared phone),
// not encryption: data in localStorage is still readable via devtools.

const KEY = 'tt_pin_hash'
const SALT = 'therapy-tracker-pin:'

const hashPin = async (pin: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + pin))
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

export const hasPin = (): boolean => !!localStorage.getItem(KEY)

export const setPin = async (pin: string): Promise<void> => {
  localStorage.setItem(KEY, await hashPin(pin))
}

export const verifyPin = async (pin: string): Promise<boolean> =>
  (await hashPin(pin)) === localStorage.getItem(KEY)

export const clearPin = (): void => localStorage.removeItem(KEY)
