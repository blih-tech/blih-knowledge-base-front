'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DocumentCategory } from './types';
import { documentsData as mockData } from './data';

interface AdminContextType {
  categories: DocumentCategory[];
  updateCategory: (id: string, category: DocumentCategory) => void;
  addCategory: (category: DocumentCategory) => void;
  deleteCategory: (id: string) => void;
  loadData: () => void;
  saveData: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'blih-brain-admin-data';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage or use mock data
  const loadData = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (stored) {
          setCategories(JSON.parse(stored));
        } else {
          setCategories(JSON.parse(JSON.stringify(mockData)));
        }
      } catch (error) {
        console.error('[v0] Error loading admin data:', error);
        setCategories(JSON.parse(JSON.stringify(mockData)));
      }
    }
    setIsLoaded(true);
  };

  // Save data to localStorage
  const saveData = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(categories));
      } catch (error) {
        console.error('[v0] Error saving admin data:', error);
      }
    }
  };

  // Load on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save whenever categories change
  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [categories, isLoaded]);

  const updateCategory = (id: string, updatedCategory: DocumentCategory) => {
    setCategories(categories.map(cat => (cat.id === id ? updatedCategory : cat)));
  };

  const addCategory = (newCategory: DocumentCategory) => {
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <AdminContext.Provider value={{ categories, updateCategory, addCategory, deleteCategory, loadData, saveData }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
