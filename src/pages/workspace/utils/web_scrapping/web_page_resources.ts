export interface WebPageResources {
  timestamp: number;
  scripts?: WebPageResource[];
  styles?: WebPageResource[];
}

export interface WebPageResource {
  url: string;
  digest?: string;
  size?: number;
}
