import { Icon } from './libs/Icon'

export class Background {
  #icon: Icon
  #tabSockets: Record<number, WebSocket> = {}
  #tabRetryCounts: Record<number, number> = {}

  constructor() {
    this.#icon = new Icon()

    chrome.tabs.onUpdated.addListener(this.#handleTabUpdated)
    chrome.tabs.onRemoved.addListener(this.#handleTabRemoved)
  }

  #debug(tabId: number, type: 'STATE', ...args: any[]): void {
    console.debug('[OpenAI Forge]', type, ...args)

    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.tabs.sendMessage(tabId, {
        type,
        value: args.join(' '),
      })
    })
  }

  #handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (changeInfo.status !== 'complete') {
      if (!changeInfo.status) {
        return
      }

      let previousWebSocket = this.#tabSockets[tabId]
      if (previousWebSocket) {
        this.#debug(tabId, 'STATE', 'CLOSING')
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

    if (url.hostname !== 'chat.openai.com' || !url.pathname.startsWith('/c/')) {
      return
    }

    this.#debug(tabId, 'STATE', 'MATCHED')
    this.#startWebSocketClient(tabId)
  }

  #handleTabRemoved = (tabId: number) => {
    let previousWebSocket = this.#tabSockets[tabId]
    if (previousWebSocket) {
      this.#debug(tabId, 'STATE', 'CLOSING')
      previousWebSocket.close()
      delete this.#tabSockets[tabId]
    }
  }

  #restartWebSocketClient(tabId: number): void {
    const tabRetryCount = this.#tabRetryCounts[tabId]
    if (!tabRetryCount) {
      return
    }

    if (tabRetryCount < 60) {
      this.#tabRetryCounts[tabId] = tabRetryCount + 1

      setTimeout(() => this.#startWebSocketClient(tabId, true), 5000)
    } else {
      this.#debug(tabId, 'STATE', 'TOO_MANY_RETRIES')
    }
  }

  #startWebSocketClient(tabId: number, isRetry: boolean = false): void {
    try {
      this.#debug(tabId, 'STATE', isRetry ? 'RECONNECTING' : 'CONNECTING')

      if (!isRetry) {
        this.#tabRetryCounts[tabId] = 0
      }

      const webSocket = new WebSocket('ws://localhost:4242')
      this.#tabSockets[tabId] = webSocket

      webSocket.onopen = () => {
        this.#debug(tabId, 'STATE', 'CONNECTED')

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
          this.#debug(tabId, 'STATE', 'CLOSED', event.code, event.reason)
        } else {
          this.#debug(tabId, 'STATE', 'DIED', event.code, event.reason)
          this.#restartWebSocketClient(tabId)
        }
      }
    } catch (err) {
      console.debug('[OpenAI Forge]', 'ERROR', String(err))
      this.#restartWebSocketClient(tabId)
    }
  }
}
