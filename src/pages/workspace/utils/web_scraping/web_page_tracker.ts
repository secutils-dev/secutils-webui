export interface WebPageTracker<S = unknown> {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  settings: {
    revisions: number;
    delay: number;
    schedule?: string;
    scripts?: S;
  };
}

export interface WebPageResourcesTracker
  extends WebPageTracker<{
    resourceFilterMap?: string;
  }> {}

export interface WebPageContentTracker
  extends WebPageTracker<{
    extractContent?: string;
  }> {}
