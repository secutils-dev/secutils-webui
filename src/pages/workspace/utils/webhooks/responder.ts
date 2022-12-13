import { User } from '../../../../model';

export const RESPONDERS_DATA_KEY = 'hp.ar';

export interface SerializedResponder {
  a: string;
  m: string;
  s: number;
  h?: Array<[string, string]>;
  b?: string;
}

export interface Responder {
  alias: string;
  method: string;
  statusCode: number;
  headers?: Array<[string, string]>;
  body?: string;
}

export function deserializeResponder(serializedResponder: SerializedResponder): Responder {
  const responder: Responder = {
    alias: serializedResponder.a,
    method: serializedResponder.m,
    statusCode: serializedResponder.s,
  };

  if (serializedResponder.h) {
    responder.headers = serializedResponder.h;
  }

  if (serializedResponder.b) {
    responder.body = serializedResponder.b;
  }

  return responder;
}

export function serializeResponder(responder: Responder): SerializedResponder {
  const serializedResponder: SerializedResponder = {
    a: responder.alias,
    m: responder.method,
    s: responder.statusCode,
    h: responder.headers,
  };

  if (responder.headers) {
    serializedResponder.h = responder.headers;
  }

  if (responder.body != null) {
    serializedResponder.b = responder.body;
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
