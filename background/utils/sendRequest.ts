import type { Request } from '../../common/types'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function sendRequest(tabId: number, request: Request, ...args: any[]): Promise<void> {
  try {
    console.info(`[${tabId}]`, `[${request.type}]`, request.value, ...args)

    await chrome.tabs.sendMessage(tabId, request)
  } catch (_err) {
    // Avoid `Could not establish connection. Receiving end does not exist.` error
    // when the content script is not ready to receive messages (after a reload for example).
  }
}
