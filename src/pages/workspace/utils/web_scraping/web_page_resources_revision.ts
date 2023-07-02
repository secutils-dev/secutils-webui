import type { WebPageResource } from './web_page_resource';

export interface WebPageResourcesRevision {
  timestamp: number;
  scripts?: WebPageResource[];
  styles?: WebPageResource[];
}
