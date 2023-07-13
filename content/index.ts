import Toastify from 'toastify-js'

import 'toastify-js/src/toastify.css'

function showToast(message: string) {
  Toastify({
    duration: 5000,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: 'linear-gradient(to right, #36d1dc, #5b86e5)',
      boxShadow: 'none',
    },
    text: message,
  }).showToast()
}

chrome.runtime.onMessage.addListener(request => {
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
