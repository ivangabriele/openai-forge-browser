const TAB_SOCKETS: Record<number, WebSocket> = {}
const TAB_RETRY_COUNTS: Record<number, number> = {}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') {
    if (!changeInfo.status) {
      return
    }

    let previousWebSocket = TAB_SOCKETS[tabId]
    if (previousWebSocket) {
      debug(tabId, 'STATE', 'CLOSING')

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

  debug(tabId, 'STATE', 'MATCHED')

  startWebSocketClient(tabId)
})

chrome.tabs.onRemoved.addListener(tabId => {
  let previousWebSocket = TAB_SOCKETS[tabId]
  if (previousWebSocket) {
    debug(tabId, 'STATE', 'CLOSING')

    previousWebSocket.close()
    delete TAB_SOCKETS[tabId]
  }
})

function debug(tabId: number, type: 'STATE', ...args: any[]): void {
  console.debug('[OpenAI Forge]', type, ...args)

  chrome.tabs.query({ active: true, currentWindow: true }, () => {
    chrome.tabs.sendMessage(tabId, {
      type,
      value: args.join(' '),
    })
  })
}

function restartWebSocketClient(tabId: number): void {
  const tabRetryCount = TAB_RETRY_COUNTS[tabId]
  if (!tabRetryCount) {
    return
  }

  if (tabRetryCount < 60) {
    TAB_RETRY_COUNTS[tabId] = tabRetryCount + 1

    setTimeout(() => startWebSocketClient(tabId, true), 5000)
  } else {
    debug(tabId, 'STATE', 'TOO_MANY_RETRIES')
  }
}

function startWebSocketClient(tabId: number, isRetry: boolean = false): void {
  try {
    debug(tabId, 'STATE', isRetry ? 'RECONNECTING' : 'CONNECTING')

    if (!isRetry) {
      TAB_RETRY_COUNTS[tabId] = 0
    }

    const webSocket = new WebSocket('ws://localhost:4242')
    TAB_SOCKETS[tabId] = webSocket

    webSocket.onopen = () => {
      debug(tabId, 'STATE', 'CONNECTED')

      chrome.tabs.query({ active: true, currentWindow: true }, () => {
        chrome.tabs.sendMessage(tabId, {
          type: 'STATE',
          value: 'CONNECTED',
        })
      })
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
      if (event.wasClean) {
        debug(tabId, 'STATE', 'CLOSED', event.code, event.reason)
      } else {
        debug(tabId, 'STATE', 'DIED', event.code, event.reason)

        restartWebSocketClient(tabId)
      }
    }
  } catch (err) {
    console.debug('[OpenAI Forge]', 'ERROR', String(err))

    restartWebSocketClient(tabId)
  }
}
