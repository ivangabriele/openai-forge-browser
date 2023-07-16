import { sendRequest } from './sendRequest'
import { RequestType } from '../../common/types'

export async function sendError(tabId: number, userMessage: string, orginalError: unknown): Promise<void> {
  await sendRequest(
    tabId,
    {
      type: RequestType.ERROR,
      value: userMessage,
    },
    orginalError,
  )
}
