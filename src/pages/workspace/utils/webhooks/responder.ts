export const RESPONDERS_USER_DATA_NAMESPACE = 'autoResponders';

export type SerializedResponders = Record<string, SerializedResponder>;

export interface SerializedResponder {
  n: string;
  m: string;
  t: number;
  s: number;
  h?: Array<[string, string]>;
  b?: string;
  d?: number;
}

export interface Responder {
  name: string;
  method: string;
  trackingRequests: number;
  statusCode: number;
  headers?: Array<[string, string]>;
  body?: string;
  delay?: number;
}

export function deserializeResponder(serializedResponder: SerializedResponder): Responder {
  const responder: Responder = {
    name: serializedResponder.n,
    method: serializedResponder.m,
    statusCode: serializedResponder.s,
    trackingRequests: serializedResponder.t,
  };

  if (serializedResponder.h) {
    responder.headers = serializedResponder.h;
  }

  if (serializedResponder.b) {
    responder.body = serializedResponder.b;
  }

  if (serializedResponder.d) {
    responder.delay = serializedResponder.d;
  }

  return responder;
}

export function deserializeResponders(serializedResponders: SerializedResponders | null): Responder[] {
  if (!serializedResponders) {
    return [];
  }

  try {
    return Object.values(serializedResponders).map(deserializeResponder);
  } catch {
    return [];
  }
}

export function serializeResponder(responder: Responder): SerializedResponder {
  const serializedResponder: SerializedResponder = {
    n: responder.name,
    m: responder.method,
    s: responder.statusCode,
    h: responder.headers,
    t: responder.trackingRequests,
  };

  if (responder.headers) {
    serializedResponder.h = responder.headers;
  }

  if (responder.body != null) {
    serializedResponder.b = responder.body;
  }

  if (responder.delay) {
    serializedResponder.d = responder.delay;
  }

  return serializedResponder;
}

export function serializeHttpMethod(method: string) {
  switch (method.toLowerCase()) {
    case 'any':
      return 'a';
    case 'get':
      return 'g';
    case 'post':
      return 'p';
    case 'put':
      return 'pu';
    case 'delete':
      return 'd';
    case 'head':
      return 'h';
    case 'options':
      return 'o';
    case 'connect':
      return 'c';
    case 'trace':
      return 't';
    case 'patch':
      return 'pa';
    default:
      throw new Error(`Unknown method to serialize: ${method}`);
  }
}

export function deserializeHttpMethod(method: string) {
  switch (method) {
    case 'a':
      return 'ANY';
    case 'g':
      return 'GET';
    case 'p':
      return 'POST';
    case 'pu':
      return 'PUT';
    case 'd':
      return 'DELETE';
    case 'h':
      return 'HEAD';
    case 'o':
      return 'OPTIONS';
    case 'c':
      return 'CONNECT';
    case 't':
      return 'TRACE';
    case 'pa':
      return 'PATCH';
    default:
      throw new Error(`Unknown method to deserialize: ${method}`);
  }
}
