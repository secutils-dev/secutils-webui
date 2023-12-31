export interface Responder {
  id: string;
  name: string;
  path: string;
  method: string;
  settings: {
    requestsToTrack: number;
    statusCode: number;
    headers?: Array<[string, string]>;
    body?: string;
    script?: string;
  };
  createdAt: number;
}
