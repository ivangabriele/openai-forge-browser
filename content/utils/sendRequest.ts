import type { Request } from '../../common/types'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function sendRequest(request: Request, ...args: any[]): void {
  try {
    console.info('[Content Script]', `[${request.type}]`, request.value, ...args)

    chrome.runtime.sendMessage(request)
  } catch (_err) {
    // Avoid `Could not establish connection. Receiving end does not exist.` error
    // when the content script is not ready to receive messages (after a reload for example).
  }
}
