import type { WebPageResource } from './web_page_resource';

export interface WebPageResourcesRevision {
  id: string;
  scripts?: WebPageResource[];
  styles?: WebPageResource[];
  createdAt: number;
}
