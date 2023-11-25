export interface ResponderRequest {
  id: string;
  clientAddress?: string;
  method: string;
  headers?: Array<[string, number[]]>;
  body?: number[];
  createdAt: number;
}
