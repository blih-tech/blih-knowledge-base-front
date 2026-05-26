import { DocumentCategory } from './types';

// Convert ID or title to slug format
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Convert admin data format to public site format with slugs
export function convertAdminDataToPublic(adminCategories: DocumentCategory[]): DocumentCategory[] {
  return adminCategories.map(category => ({
    ...category,
    slug: toSlug(category.id),
    count: category.sections.reduce((acc, sec) => acc + sec.items.length, 0),
    sections: category.sections.map(section => ({
      ...section,
      slug: toSlug(section.id),
      items: section.items.map(item => ({
        ...item,
        slug: toSlug(item.id),
        // Ensure content is in the right format
        ...(item.content && typeof item.content === 'object'
          ? { content: item.content }
          : {
              content: {
                title: item.title,
                docId: item.id,
                sections: [],
                tableOfContents: [],
              },
            }),
      })),
    })),
  }));
}
