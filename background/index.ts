import { RECONNECTION_DELAY_IN_MS, WEB_SOCKET_SERVER_URI } from '../common/constants'
import { type MessageData, RequestType, State } from '../common/types'
import { Icon } from './libs/Icon'
import { sendError } from './utils/sendError'
import { sendRequest } from './utils/sendRequest'
import { sendState } from './utils/sendState'

const icon: Icon = new Icon()
const tabSocket: Record<number, WebSocket> = {}
const tabTimeout: Record<number, NodeJS.Timeout | undefined> = {}

async function handleTabUpdated(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab,
): Promise<void> {
  if (changeInfo.status !== 'complete') {
    if (!changeInfo.status) {
      return
    }

    const previousWebSocket = tabSocket[tabId]
    if (previousWebSocket) {
      await sendState(tabId, State.DISCONNECTING)
      previousWebSocket.close()
    }

    return
  }

  let url: URL
  try {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    url = new URL(tab.url!)
  } catch (_err) {
    return
  }

  if (url.hostname !== 'chat.openai.com') {
    return
  }

  await sendState(tabId, State.MATCHED)

  startWebSocketClient(tabId)
}

async function handleTabRemoved(tabId: number): Promise<void> {
  clearTimeout(tabTimeout[tabId])

  const previousWebSocket = tabSocket[tabId]
  if (previousWebSocket) {
    await sendState(tabId, State.DISCONNECTING)
    previousWebSocket.close()
    delete tabSocket[tabId]
  }
}

async function restartWebSocketClient(tabId: number): Promise<void> {
  await sendState(tabId, State.WILL_RECONNECT)

  tabTimeout[tabId] = setTimeout(() => startWebSocketClient(tabId, true), RECONNECTION_DELAY_IN_MS)
}

async function startWebSocketClient(tabId: number, isRetry = false): Promise<void> {
  try {
    await sendState(tabId, isRetry ? State.RECONNECTING : State.CONNECTING)

    try {
      await fetch(WEB_SOCKET_SERVER_URI.replace('ws', 'http'), {
        mode: 'no-cors',
      })
    } catch (_err) {
      restartWebSocketClient(tabId)

      return
    }

    const webSocket = new WebSocket(WEB_SOCKET_SERVER_URI)
    tabSocket[tabId] = webSocket

    webSocket.onopen = async () => {
      clearTimeout(tabTimeout[tabId])

      await sendState(tabId, State.CONNECTED)

      await icon.animate()
    }

    webSocket.onmessage = async (event: MessageEvent) => {
      const data: MessageData = JSON.parse(event.data)

      await sendRequest(tabId, {
        type: RequestType.DATA,
        value: data,
      })
    }

    webSocket.onerror = error => {
      console.error('[OpenAI Forge]', 'ERROR', String(error))
    }

    webSocket.onclose = async event => {
      await icon.stop()

      if (event.wasClean) {
        await sendState(tabId, State.DISCONNECTED, event.code, event.reason)
      } else {
        await sendState(tabId, State.DISCONNECTED, event.code, event.reason)

        // The WebSocket client was disconnected because the server went off
        if (event.code === 1006) {
          // Let's try to reconnect
          await restartWebSocketClient(tabId)
        }
      }
    }
  } catch (err) {
    clearTimeout(tabTimeout[tabId])

    await sendError(tabId, 'An unexpected error happened', err)
  }
}

chrome.tabs.onUpdated.addListener(handleTabUpdated)
chrome.tabs.onRemoved.addListener(handleTabRemoved)
