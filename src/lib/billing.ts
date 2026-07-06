import type { Session, Client } from './types'
import { sessionCost } from './rates'

// A session is billable if it was held, or cancelled too late to waive the fee.
export const isBillable = (s: Session) => s.status === 'completed' || s.status === 'late_cancel'

export const billableTotal = (sessions: Session[], client: Client) =>
  sessions.filter(isBillable).reduce((sum, s) => sum + sessionCost(client, s), 0)
