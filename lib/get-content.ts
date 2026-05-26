'use client';

import { DocumentCategory } from './types';
import { documentsData as mockData } from './data';
import { convertAdminDataToPublic } from './convert-data';

const ADMIN_STORAGE_KEY = 'blih-brain-admin-data';

export function getContent(): DocumentCategory[] {
  if (typeof window === 'undefined') {
    return JSON.parse(JSON.stringify(mockData));
  }

  try {
    const adminData = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (adminData) {
      const parsedData = JSON.parse(adminData);
      return convertAdminDataToPublic(parsedData);
    }
  } catch (error) {
    console.error('[v0] Error loading admin data:', error);
  }

  return JSON.parse(JSON.stringify(mockData));
}

export function getDocument(categoryId: string, sectionId: string, documentId: string) {
  const categories = getContent();
  const category = categories.find(c => c.id === categoryId);
  const section = category?.sections.find(s => s.id === sectionId);
  const document = section?.items.find(i => i.id === documentId);
  return document;
}

export function getCategoryById(categoryId: string) {
  const categories = getContent();
  return categories.find(c => c.id === categoryId);
}

export function getSectionById(categoryId: string, sectionId: string) {
  const category = getCategoryById(categoryId);
  return category?.sections.find(s => s.id === sectionId);
}
