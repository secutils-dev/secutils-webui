export interface WebPageResourcesTracker {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  settings: {
    revisions: number;
    delay: number;
    schedule?: string;
    scripts?: {
      resourceFilterMap?: string;
    };
  };
}
