export interface WebPageResources {
  timestamp: number;
  scripts?: WebPageResource[];
  styles?: WebPageResource[];
}

export interface WebPageResource {
  url?: string;
  content?: WebPageResourceContent;
}

export interface WebPageResourceContent {
  digest: string;
  size: number;
}
