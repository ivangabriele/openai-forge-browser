import { RequestType, type State } from '../../common/types'
import { sendRequest } from '../../common/utils/sendRequest'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
