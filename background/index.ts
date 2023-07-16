import { Icon } from './libs/Icon'
import { RECONNECTION_DELAY_IN_MS } from '../common/constants'
import { RequestType, State, type Request } from '../common/types'

class Background {
  #icon: Icon
  #tabSocket: Record<number, WebSocket> = {}
  #tabTimeout: Record<number, NodeJS.Timeout | undefined> = {}

  constructor() {
    this.#icon = new Icon()

    chrome.tabs.onUpdated.addListener(this.#handleTabUpdated)
    chrome.tabs.onRemoved.addListener(this.#handleTabRemoved)
  }

  // eslint-disable-next-line class-methods-use-this
  #debug(tabId: number, type: RequestType.ERROR, userMessage: string, orginalError: unknown): void {
    console.debug(`[${type}]`, String(orginalError))
    console.debug(orginalError)

    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.tabs.sendMessage<Request>(tabId, {
        type,
        value: userMessage,
      })
    })
  }

  #handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (changeInfo.status !== 'complete') {
      if (!changeInfo.status) {
        return
      }

      const previousWebSocket = this.#tabSocket[tabId]
      if (previousWebSocket) {
        this.#sendState(tabId, State.DISCONNECTING)
        previousWebSocket.close()
      }

      return
    }

    let url: URL
    try {
      url = new URL(tab.url!)
    } catch (_err) {
      return
    }

    if (url.hostname !== 'chat.openai.com') {
      return
    }

    this.#sendState(tabId, State.MATCHED)
    this.#startWebSocketClient(tabId)
  }

  #handleTabRemoved = (tabId: number) => {
    const previousWebSocket = this.#tabSocket[tabId]
    if (previousWebSocket) {
      this.#sendState(tabId, State.DISCONNECTING)
      previousWebSocket.close()
      delete this.#tabSocket[tabId]
    }
  }

  #restartWebSocketClient(tabId: number): void {
    this.#sendState(tabId, State.WILL_RECONNECT)

    this.#tabTimeout[tabId] = setTimeout(() => this.#startWebSocketClient(tabId, true), RECONNECTION_DELAY_IN_MS)
  }

  #startWebSocketClient(tabId: number, isRetry: boolean = false): void {
    try {
      this.#sendState(tabId, isRetry ? State.RECONNECTING : State.DISCONNECTING)

      const webSocket = new WebSocket('ws://localhost:4242')
      this.#tabSocket[tabId] = webSocket

      webSocket.onopen = () => {
        this.#sendState(tabId, State.CONNECTED)

        clearTimeout(this.#tabTimeout[tabId])

        this.#icon.animate()
      }

      webSocket.onmessage = event => {
        console.debug('[OpenAI Forge]', 'MESSAGE', event.type, event.data)

        chrome.tabs.query({ active: true, currentWindow: true }, () => {
          const data = JSON.parse(event.data)

          chrome.tabs.sendMessage(tabId, {
            type: 'DATA',
            value: data,
          })
        })
      }

      webSocket.onerror = error => {
        console.debug('[OpenAI Forge]', 'ERROR', String(error))
      }

      webSocket.onclose = event => {
        this.#icon.stop()

        if (event.wasClean) {
          this.#sendState(tabId, State.DISCONNECTED, event.code, event.reason)
        } else {
          this.#sendState(tabId, State.DISCONNECTED, event.code, event.reason)
        }

        this.#restartWebSocketClient(tabId)
      }
    } catch (err) {
      this.#debug(tabId, RequestType.ERROR, 'An unexpected error happened', err)

      clearTimeout(this.#tabTimeout[tabId])
    }
  }

  // eslint-disable-next-line class-methods-use-this
  #sendState(tabId: number, state: State, ...args: any[]): void {
    console.debug('[STATE]', state, ...args)

    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.tabs.sendMessage<Request>(tabId, {
        type: RequestType.STATE,
        value: state,
      })
    })
  }
}

// eslint-disable-next-line no-new
new Background()
