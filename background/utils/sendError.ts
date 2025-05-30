import { RequestType } from '../../common/types'
import { sendRequest } from './sendRequest'

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
