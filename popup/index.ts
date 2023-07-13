chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.type === 'WS_STATE') {
    const websocketState = document.getElementById('websocketState')
    if (!websocketState) {
      return
    }

    websocketState.innerText = request.state
  }
})
