import { sendRequest } from './sendRequest'
import { State, RequestType } from '../../common/types'

export async function sendState(tabId: number, state: State, ...args: any): Promise<void> {
  await sendRequest(
    tabId,
    {
      type: RequestType.STATE,
      value: state,
    },
    ...args,
  )
}
