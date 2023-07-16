import { State } from './types'

export const RECONNECTION_DELAY_IN_MS = 5000

export const STATE_LABEL: Record<State, string> = {
  [State.CONNECTING]: 'Connecting...',
  [State.CONNECTED]: 'Connected',
  [State.DISCONNECTED]: 'Disconnected',
  [State.DISCONNECTING]: 'Disconnecting...',
  [State.MATCHED]: 'ChatGPT Tab Detected',
  [State.RECONNECTING]: 'Reconnecting...',
  [State.WILL_RECONNECT]: `Reconnecting in ${RECONNECTION_DELAY_IN_MS / 1000}s...`,
}
