export interface DocumentItem {
  id: string;
  title: string;
  slug: string;
  category: 'procedures' | 'job-descriptions' | 'company-overview' | 'policies';
  section: string;
  docId?: string;
  content?: DocumentContent;
}

export interface DocumentSection {
  id: string;
  title: string;
  slug: string;
  items: DocumentItem[];
}

export interface DocumentCategory {
  id: string;
  title: string;
  slug: string;
  count: number;
  sections: DocumentSection[];
}

export interface DocumentContent {
  title: string;
  docId: string;
  sections: ContentSection[];
  tableOfContents: TOCItem[];
}

export interface ContentSection {
  id: string;
  title: string;
  number: string;
  content: string;
  subsections?: ContentSection[];
}

export interface TOCItem {
  id: string;
  title: string;
  number: string;
  level: number;
  children?: TOCItem[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}
