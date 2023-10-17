import type { SystemEventName } from '../electron/system-event'

declare global {
  var electronAPI: {
    onSystemLockScreen: (callback: () => void) => void,
    onSystemUnlockScreen: (callback: () => void) => void
  }
}