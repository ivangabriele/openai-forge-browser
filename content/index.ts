import { STATE_CSS_CLASS, STATE_LABEL } from '../common/constants'
import { Action, type Request, RequestType, type State } from '../common/types'
import { getThreadAsMarkdown } from './actions/getThreadAsMarkdown'
import { sendRequest } from './utils/sendRequest'

function clearBadgeCssClasses() {
  for (const className of badgeElement.classList) {
    if (['Badge', 'is-open'].includes(className)) {
      return
    }

    badgeElement.classList.remove(className)
  }
}

function setBadgeError(errorMessage: string) {
  if (!tooltipBodyElement.classList.contains('has-error')) {
    tooltipBodyElement.classList.add('has-error')
  }

  tooltipBodyElement.innerText = errorMessage
}

function toggleTooltip() {
  const isTooltipOpen = tootipElement.classList.contains('is-open')

  if (isTooltipOpen) {
    tootipElement.classList.remove('is-open')
  } else {
    tootipElement.classList.add('is-open')
  }
}

function updateBadgeState(nextState: State) {
  clearBadgeCssClasses()
  badgeElement.classList.add(STATE_CSS_CLASS[nextState])

  if (tooltipBodyElement.classList.contains('has-error')) {
    tooltipBodyElement.classList.remove('has-error')
  }
  tooltipBodyElement.innerText = STATE_LABEL[nextState]
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
chrome.runtime.onMessage.addListener((request: Request, _sender, _sendResponse) => {
  if (request.type === RequestType.DATA) {
    if (request.value.action === Action.ASK) {
      // Handle both normal chats and Custom GPT sandbox chat which have 2 textareas
      const promptTextareas: NodeListOf<HTMLTextAreaElement> = document.querySelectorAll('textarea#prompt-textarea')
      const promptTextarea: HTMLTextAreaElement | undefined = promptTextareas[1] || promptTextareas[0]
      if (!promptTextarea) {
        return
      }
      const promptBoxButtons = promptTextarea.parentElement?.querySelectorAll('button')
      if (!promptBoxButtons) {
        return
      }
      const lastPromptBoxButton = promptBoxButtons[promptBoxButtons.length - 1]
      if (!lastPromptBoxButton) {
        return
      }
      const isSubmitButton = lastPromptBoxButton.dataset.testid === 'send-button'

      promptTextarea.value = request.value.message
      promptTextarea.dispatchEvent(new Event('input', { bubbles: true }))

      if (isSubmitButton) {
        lastPromptBoxButton.click()
      }
    }

    if (request.value.action === Action.GET_THREAD_AS_MARKDOWN) {
      const threadAsMarkdown = getThreadAsMarkdown()

      sendRequest({
        type: RequestType.DATA,
        value: {
          action: Action.SEND_THREAD_AS_MARKDOWN,
          message: threadAsMarkdown,
        },
      })
    }

    return
  }

  if (request.type === RequestType.ERROR) {
    setBadgeError(request.value)
  }

  if (request.type === RequestType.STATE) {
    updateBadgeState(request.value)
  }
})

const IS_DARK_MODE = document.querySelector('html')?.classList.contains('dark')

// ---------------------------------------------------------
// Box

const boxElement = document.createElement('div')
boxElement.id = 'openai-forge'

// ---------------------------------------------------------
// Badge

const badgeElement = document.createElement('button')
badgeElement.classList.add('Badge')

const buttonElementIconUrl = IS_DARK_MODE
  ? chrome.runtime.getURL('assets/icon-dark.svg')
  : chrome.runtime.getURL('assets/icon.svg')
const badgeImageElement = document.createElement('img')
badgeImageElement.src = buttonElementIconUrl
badgeElement.appendChild(badgeImageElement)

badgeElement.addEventListener('click', toggleTooltip)

boxElement.appendChild(badgeElement)

// ---------------------------------------------------------
// Tooltip

const tootipElement = document.createElement('div')
tootipElement.classList.add('Tooltip')

const tooltipHeaderElement = document.createElement('div')
tooltipHeaderElement.classList.add('Tooltip-header')
tooltipHeaderElement.innerText = 'OpenAI Forge'
tootipElement.appendChild(tooltipHeaderElement)

const tooltipBodyElement = document.createElement('div')
tooltipBodyElement.classList.add('Tooltip-body')
tooltipBodyElement.innerText = 'Loaddng...'
tootipElement.appendChild(tooltipBodyElement)

boxElement.appendChild(tootipElement)

// ---------------------------------------------------------
// DOM initialization

document.body.appendChild(boxElement)

// ---------------------------------------------------------
// Sanity check

console.info('OpenAI Forge', 'Content script loaded.')
