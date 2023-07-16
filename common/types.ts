export type Request =
  | {
      type: RequestType.DATA
      value: {
        action: Action
        message: string
      }
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

export enum Action {
  ASK = 'ASK',
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
