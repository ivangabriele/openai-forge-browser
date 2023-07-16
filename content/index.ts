import { STATE_LABEL } from '../common/constants'
import { RequestType, type Request, Action } from '../common/types'

function updatedBadge(message: string, isError: boolean = false) {
  bodyElement.innerText = message

  if (isError && !bodyElement.classList.contains('with-error')) {
    bodyElement.classList.add('with-error')
  } else if (bodyElement.classList.contains('with-error')) {
    bodyElement.classList.remove('with-error')
  }
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
    updatedBadge(request.value, true)
  }

  if (request.type === RequestType.STATE) {
    updatedBadge(STATE_LABEL[request.value])
  }
})

const rootElement = document.createElement('div')
rootElement.id = 'openai-forge'

const headerElement = document.createElement('div')
headerElement.classList.add('header')
headerElement.innerText = 'OpenAI Forge'

const bodyElement = document.createElement('div')
bodyElement.classList.add('body')
bodyElement.innerText = 'Loaddng...'

rootElement.appendChild(headerElement)
rootElement.appendChild(bodyElement)
document.body.appendChild(rootElement)

console.debug('OpenAI Forge', 'Content script loaded.')
