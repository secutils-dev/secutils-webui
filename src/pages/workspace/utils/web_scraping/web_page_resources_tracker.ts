export const WEB_PAGE_RESOURCES_TRACKERS_USER_DATA_NAMESPACE = 'webPageResourcesTrackers';

export type WebPageResourcesTrackers = Record<string, WebPageResourcesTracker>;

export interface WebPageResourcesTracker {
  name: string;
  url: string;
  revisions: number;
  delay: number;
}
