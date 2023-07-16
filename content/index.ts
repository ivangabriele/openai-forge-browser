import Toastify from 'toastify-js'

import 'toastify-js/src/toastify.css'
import { STATE_LABEL } from '../common/constants'
import { RequestType, type Request, Action } from '../common/types'

// let LAST_TOAST: Toastify | undefined
let LAST_TOAST: any

function showToast(message: string, isError: boolean = false) {
  if (LAST_TOAST) {
    LAST_TOAST.hideToast()
  }

  const newToast = Toastify({
    duration: 5000,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: isError ? '#fc3623' : '#e52b50',
      borderRadius: '0',
      boxShadow: 'none',
      padding: '4px 12px 8px',
    },
    text: message,
  })

  newToast.showToast()

  LAST_TOAST = newToast
}

chrome.runtime.onMessage.addListener((request: Request) => {
  if (request.type === RequestType.DATA) {
    if (request.value.action === Action.ASK) {
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

  if (request.type === RequestType.ERROR) {
    showToast(`OpenAI Forge: ${request.value}`, true)
  }

  if (request.type === RequestType.STATE) {
    showToast(`OpenAI Forge: ${STATE_LABEL[request.value]}`)
  }
})
