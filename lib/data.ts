import { DocumentCategory, DocumentSection, DocumentItem, DocumentContent } from './types';

export const documentsData: DocumentCategory[] = [
  {
    id: 'procedures',
    title: 'Procedures',
    slug: 'procedures',
    count: 13,
    sections: [
      {
        id: 'tech-dept',
        title: 'Technology Dept',
        slug: 'technology-dept',
        items: [
          {
            id: 'proj-prod-init',
            title: 'Project/Product Initiation Procedure',
            slug: 'project-product-initiation-procedure',
            category: 'procedures',
            section: 'Technology Dept',
          },
          {
            id: 'proj-prod-plan',
            title: 'Project/Product Planning Procedure',
            slug: 'project-product-planning-procedure',
            category: 'procedures',
            section: 'Technology Dept',
            docId: 'BM-TD-P-25-002',
            content: {
              title: 'Project/Product Planning Procedure',
              docId: 'BM-TD-P-25-002',
              tableOfContents: [
                { id: '1', title: 'Purpose', number: '1', level: 1 },
                { id: '2', title: 'Scope of Application', number: '2', level: 1 },
                { id: '3', title: 'Definition', number: '3', level: 1 },
                { id: '4', title: 'Responsibility', number: '4', level: 1 },
                { id: '5', title: 'Work flow', number: '5', level: 1 },
                { id: '6', title: 'Generating records', number: '6', level: 1 },
                { id: '7', title: 'Reference documents', number: '7', level: 1 },
                { id: '8', title: 'Relevant documents', number: '8', level: 1 },
                { id: '9', title: 'Flow chart', number: '9', level: 1 },
              ],
              sections: [
                {
                  id: 'purpose',
                  title: 'Purpose',
                  number: '1',
                  content: 'This procedure establishes a formal and standardized process for planning all approved projects and products within Blih Technology Solutions\' Technology Department. Its purpose is to ensure that all technical, business, financial, and design aspects are meticulously documented, aligned, and prepared for efficient execution within an Agile development environment.',
                },
                {
                  id: 'scope',
                  title: 'Scope of Application',
                  number: '2',
                  content: 'This procedure applies to all technology-driven project and product planning activities that follow executive approval from the Project/Product Initiation Procedure (BM-TD-P-25-001). It covers all planning-related tasks and responsibilities prior to the formal commencement of the development (sprint execution) phase.',
                },
                {
                  id: 'definition',
                  title: 'Definition',
                  number: '3',
                  content: 'Key terms and definitions used throughout this procedure are standardized across the organization to ensure clarity and consistency in project planning activities.',
                },
                {
                  id: 'responsibility',
                  title: 'Responsibility',
                  number: '4',
                  content: 'Clear roles and responsibilities are defined for all stakeholders involved in the project planning process.',
                },
                {
                  id: 'workflow',
                  title: 'Work flow',
                  number: '5',
                  content: 'The workflow section outlines the step-by-step process for planning projects and products.',
                },
                {
                  id: 'records',
                  title: 'Generating records',
                  number: '6',
                  content: 'Documentation and record generation requirements are specified.',
                },
                {
                  id: 'reference',
                  title: 'Reference documents',
                  number: '7',
                  content: 'Reference documents section lists related procedural documentation.',
                },
                {
                  id: 'relevant',
                  title: 'Relevant documents',
                  number: '8',
                  content: 'Relevant documents section contains supporting materials.',
                },
                {
                  id: 'flowchart',
                  title: 'Flow chart',
                  number: '9',
                  content: 'Visual representation of the project planning workflow.',
                },
              ],
            },
          },
        ],
      },
      {
        id: 'people-mgmt-dept',
        title: 'People Management Dept',
        slug: 'people-management-dept',
        items: [
          {
            id: 'promotion-transfer',
            title: 'Promotion, Transfer and Demotion Criteria and Process Procedure',
            slug: 'promotion-transfer-demotion-procedure',
            category: 'procedures',
            section: 'People Management Dept',
          },
          {
            id: 'meeting-conducting',
            title: 'Meeting Conducting procedure',
            slug: 'meeting-conducting-procedure',
            category: 'procedures',
            section: 'People Management Dept',
          },
          {
            id: 'training-knowledge',
            title: 'Training and knowledge procedure',
            slug: 'training-knowledge-procedure',
            category: 'procedures',
            section: 'People Management Dept',
          },
          {
            id: 'recruitment-selection',
            title: 'Recruitment and selection procedure',
            slug: 'recruitment-selection-procedure',
            category: 'procedures',
            section: 'People Management Dept',
          },
        ],
      },
      {
        id: 'digital-dept',
        title: 'Digital Dept',
        slug: 'digital-dept',
        items: [
          {
            id: 'digital-proc-1',
            title: 'Digital Process 1',
            slug: 'digital-process-1',
            category: 'procedures',
            section: 'Digital Dept',
          },
          {
            id: 'digital-proc-2',
            title: 'Digital Process 2',
            slug: 'digital-process-2',
            category: 'procedures',
            section: 'Digital Dept',
          },
          {
            id: 'digital-proc-3',
            title: 'Digital Process 3',
            slug: 'digital-process-3',
            category: 'procedures',
            section: 'Digital Dept',
          },
        ],
      },
      {
        id: 'business-dev-dept',
        title: 'Business Dev Dept',
        slug: 'business-dev-dept',
        items: [
          {
            id: 'business-proc-1',
            title: 'Business Process 1',
            slug: 'business-process-1',
            category: 'procedures',
            section: 'Business Dev Dept',
          },
          {
            id: 'business-proc-2',
            title: 'Business Process 2',
            slug: 'business-process-2',
            category: 'procedures',
            section: 'Business Dev Dept',
          },
          {
            id: 'business-proc-3',
            title: 'Business Process 3',
            slug: 'business-process-3',
            category: 'procedures',
            section: 'Business Dev Dept',
          },
          {
            id: 'business-proc-4',
            title: 'Business Process 4',
            slug: 'business-process-4',
            category: 'procedures',
            section: 'Business Dev Dept',
          },
        ],
      },
    ],
  },
  {
    id: 'job-descriptions',
    title: 'Job Descriptions',
    slug: 'job-descriptions',
    count: 8,
    sections: [
      {
        id: 'business-dev-jd',
        title: 'Business Dev Dept JD',
        slug: 'business-dev-dept-jd',
        items: [
          {
            id: 'biz-dev-officer',
            title: 'Job Description of Business Development Officer',
            slug: 'job-description-business-development-officer',
            category: 'job-descriptions',
            section: 'Business Dev Dept JD',
          },
          {
            id: 'account-manager',
            title: 'Job Description Of Account Manager',
            slug: 'job-description-account-manager',
            category: 'job-descriptions',
            section: 'Business Dev Dept JD',
          },
          {
            id: 'function-job-biz-dev',
            title: 'Function and Job Description Of Business Development Dept',
            slug: 'function-job-business-development-dept',
            category: 'job-descriptions',
            section: 'Business Dev Dept JD',
          },
        ],
      },
      {
        id: 'finance-dept-jd',
        title: 'Finance Dept JD',
        slug: 'finance-dept-jd',
        items: [
          {
            id: 'finance-jd-1',
            title: 'Finance Job Description 1',
            slug: 'finance-job-description-1',
            category: 'job-descriptions',
            section: 'Finance Dept JD',
          },
          {
            id: 'finance-jd-2',
            title: 'Finance Job Description 2',
            slug: 'finance-job-description-2',
            category: 'job-descriptions',
            section: 'Finance Dept JD',
          },
          {
            id: 'finance-jd-3',
            title: 'Finance Job Description 3',
            slug: 'finance-job-description-3',
            category: 'job-descriptions',
            section: 'Finance Dept JD',
          },
        ],
      },
      {
        id: 'creative-dept-jd',
        title: 'Creative Dept JD',
        slug: 'creative-dept-jd',
        items: [
          {
            id: 'creative-jd-1',
            title: 'Creative Job Description 1',
            slug: 'creative-job-description-1',
            category: 'job-descriptions',
            section: 'Creative Dept JD',
          },
        ],
      },
      {
        id: 'tech-dept-jd',
        title: 'Technology Dept JD',
        slug: 'technology-dept-jd',
        items: [
          {
            id: 'tech-jd-1',
            title: 'Technology Job Description 1',
            slug: 'technology-job-description-1',
            category: 'job-descriptions',
            section: 'Technology Dept JD',
          },
        ],
      },
    ],
  },
  {
    id: 'company-overview',
    title: 'Company Overview',
    slug: 'company-overview',
    count: 6,
    sections: [
      {
        id: 'mission-statement',
        title: 'Mission Statement',
        slug: 'mission-statement',
        items: [
          {
            id: 'blih-mission',
            title: 'Blih Mission',
            slug: 'blih-mission',
            category: 'company-overview',
            section: 'Mission Statement',
          },
        ],
      },
      {
        id: 'vision-statement',
        title: 'Vision Statement',
        slug: 'vision-statement',
        items: [
          {
            id: 'blih-vision',
            title: 'Blih Vision',
            slug: 'blih-vision',
            category: 'company-overview',
            section: 'Vision Statement',
          },
        ],
      },
      {
        id: 'core-values',
        title: 'Core Values',
        slug: 'core-values',
        items: [
          {
            id: 'core-values-main',
            title: 'Core Values',
            slug: 'core-values-main',
            category: 'company-overview',
            section: 'Core Values',
          },
        ],
      },
      {
        id: 'company-goals',
        title: 'Company Goals',
        slug: 'company-goals',
        items: [
          {
            id: 'company-goals-main',
            title: 'Company Goals',
            slug: 'company-goals-main',
            category: 'company-overview',
            section: 'Company Goals',
          },
        ],
      },
      {
        id: 'organizational-chart',
        title: 'Organizational Chart',
        slug: 'organizational-chart',
        items: [
          {
            id: 'org-chart-main',
            title: 'Organizational Chart',
            slug: 'organizational-chart-main',
            category: 'company-overview',
            section: 'Organizational Chart',
          },
        ],
      },
    ],
  },
  {
    id: 'policies',
    title: 'Policies',
    slug: 'policies',
    count: 1,
    sections: [
      {
        id: 'privacy-policy',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        items: [
          {
            id: 'privacy-lead-form',
            title: 'Privacy Policy (for Lead Generation Form)',
            slug: 'privacy-policy-lead-generation-form',
            category: 'policies',
            section: 'Privacy Policy',
          },
        ],
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): DocumentCategory | undefined {
  return documentsData.find(cat => cat.slug === slug);
}

export function getSectionBySlug(categorySlug: string, sectionSlug: string): DocumentSection | undefined {
  const category = getCategoryBySlug(categorySlug);
  return category?.sections.find(sec => sec.slug === sectionSlug);
}

export function getDocumentBySlug(categorySlug: string, sectionSlug: string, documentSlug: string): DocumentItem | undefined {
  const section = getSectionBySlug(categorySlug, sectionSlug);
  return section?.items.find(item => item.slug === documentSlug);
}

export function getAllDocuments(): DocumentItem[] {
  const allDocs: DocumentItem[] = [];
  documentsData.forEach(category => {
    category.sections.forEach(section => {
      allDocs.push(...section.items);
    });
  });
  return allDocs;
}
