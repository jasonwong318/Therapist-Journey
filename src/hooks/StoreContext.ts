import { createContext, useContext } from 'react'
import type { Store } from './useStore'

export const StoreContext = createContext<Store | null>(null)

export const useStoreCtx = (): Store => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStoreCtx must be used inside StoreProvider')
  return ctx
}
