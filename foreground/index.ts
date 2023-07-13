const connectButton = document.getElementById('connect') as HTMLButtonElement
const disconnectButton = document.getElementById('disconnect') as HTMLButtonElement
const messagesList = document.getElementById('messages') as HTMLUListElement

let webSocket: WebSocket | null = null

connectButton.addEventListener('click', () => {
  webSocket = new WebSocket('ws://localhost:4242')

  webSocket.onopen = (event: Event): any => {
    console.log('[open] Connection established')
    appendMessage('[open] Connection established')
  }

  webSocket.onmessage = (event: MessageEvent): any => {
    console.log(`[message] Data received from server: ${event.data}`)
    appendMessage(`[message] Data received from server: ${event.data}`)
  }

  webSocket.onerror = (event: Event): any => {
    console.log(`[error] ${event}`)
    appendMessage(`[error] ${event}`)
  }

  webSocket.onclose = (event: CloseEvent): any => {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
      appendMessage(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
    } else {
      console.log('[close] Connection died')
      appendMessage('[close] Connection died')
    }
  }
})

disconnectButton.addEventListener('click', () => {
  if (webSocket) {
    webSocket.close()
    webSocket = null
  }
})

function appendMessage(message: string) {
  const li = document.createElement('li')
  li.textContent = message
  messagesList.appendChild(li)
}
