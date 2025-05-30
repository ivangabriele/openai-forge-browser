import { Action, RequestType, type Request } from '../common/types'
import { sendRequest } from '../common/utils/sendRequest'
import { downloadMarkdownFile } from './actions/downloadMarkdownFile'
import { getCurrentTabId } from './utils/getCurrentTabId'

const $exportAsMarkdownButton = document.getElementById('button-exportAsMarkdown')
if (!$exportAsMarkdownButton) {
  throw new Error('`#button-exportAsMarkdown` element not found.')
}

$exportAsMarkdownButton.addEventListener('click', async () => {
  const currentTabId = await getCurrentTabId()
  sendRequest(currentTabId, {
    type: RequestType.DATA,
    value: {
      action: Action.GET_THREAD_AS_MARKDOWN,
      message: '',
    },
  })
})

chrome.runtime.onMessage.addListener(async (request: Request, _sender, _sendResponse) => {
  if (request.type === RequestType.DATA) {
    if (request.value.action === Action.SEND_THREAD_AS_MARKDOWN) {
      await downloadMarkdownFile(request.value.message, 'ChatGPT Thread')
    }
  }
})
