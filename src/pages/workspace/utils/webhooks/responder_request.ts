export interface SerializedResponderRequest {
  t: number;
  a?: string;
  m: string;
  h?: Array<[string, number[]]>;
  b?: number[];
}

export interface ResponderRequest {
  timestamp: number;
  address?: string;
  method: string;
  headers?: Array<[string, number[]]>;
  body?: number[];
}

export function deserializeResponderRequest(serializedResponderRequest: SerializedResponderRequest): ResponderRequest {
  const responderRequest: ResponderRequest = {
    timestamp: serializedResponderRequest.t,
    method: serializedResponderRequest.m,
  };

  if (serializedResponderRequest.a) {
    responderRequest.address = serializedResponderRequest.a;
  }

  if (serializedResponderRequest.h) {
    responderRequest.headers = serializedResponderRequest.h;
  }

  if (serializedResponderRequest.b) {
    responderRequest.body = serializedResponderRequest.b;
  }

  return responderRequest;
}
