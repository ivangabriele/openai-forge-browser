import Toastify from 'toastify-js'

import 'toastify-js/src/toastify.css'

function showToast(message: string) {
  Toastify({
    close: true,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    text: message,
  }).showToast()
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('[OpenAI Forge]', request.type, request.value)

  if (request.type === 'DATA') {
    if (request.value.action === 'ASK') {
      const promptTextarea: HTMLTextAreaElement | null = document.querySelector('textarea#prompt-textarea')
      if (!promptTextarea) {
        return
      }

      const promptButton: HTMLButtonElement | null | undefined = promptTextarea.parentElement?.querySelector('button')
      if (!promptButton) {
        return
      }

      promptTextarea.value = request.value.message
      promptTextarea.dispatchEvent(new Event('input', { bubbles: true }))
      promptButton.click()
    }

    return
  }

  if (request.type === 'STATE') {
    showToast(`STATE: ${request.value}`)
  }
})
