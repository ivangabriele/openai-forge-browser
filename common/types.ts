export enum Action {
  ASK = 'ASK',
  GET_THREAD_AS_MARKDOWN = 'GET_THREAD_AS_MARKDOWN',
  SEND_THREAD_AS_MARKDOWN = 'SEND_THREAD_AS_MARKDOWN',
}

export type MessageData = {
  action: Action
  message: string
}

export type MessageEvent = {
  data: string
}

export type Request =
  | {
      type: RequestType.DATA
      value: MessageData
    }
  | {
      type: RequestType.ERROR
      /** Error user message */
      value: string
    }
  | {
      type: RequestType.STATE
      value: State
    }

export enum RequestType {
  DATA = 'DATA',
  ERROR = 'ERROR',
  STATE = 'STATE',
}

export enum State {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  MATCHED = 'MATCHED',
  RECONNECTING = 'RECONNECTING',
  WILL_RECONNECT = 'WILL_RECONNECT',
}
