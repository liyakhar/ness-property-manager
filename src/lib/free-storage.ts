/**
 * Free Cloud Storage Solution
 * Uses JSON files and free image hosting services
 */

import fs from 'node:fs';
import path from 'node:path';

// Storage configuration
const STORAGE_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_FILE = path.join(STORAGE_DIR, 'properties.json');
const TENANTS_FILE = path.join(STORAGE_DIR, 'tenants.json');
const UPDATES_FILE = path.join(STORAGE_DIR, 'updates.json');
const IMAGES_DIR = path.join(STORAGE_DIR, 'images');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Initialize empty JSON files if they don't exist
const initializeFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
};

initializeFile(PROPERTIES_FILE);
initializeFile(TENANTS_FILE);
initializeFile(UPDATES_FILE);

// Types
export interface Property {
  id: string;
  apartmentNumber: number;
  location: string;
  rooms: number;
  readinessStatus: 'меблированная' | 'немеблированная';
  propertyType: 'аренда' | 'продажа';
  occupancyStatus: 'занята' | 'свободна';
  apartmentContents?: string;
  urgentMatter?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  apartmentId: string;
  entryDate: string;
  exitDate?: string;
  status: 'current' | 'past' | 'future' | 'upcoming';
  notes?: string;
  receivePaymentDate: string;
  utilityPaymentDate?: string;
  internetPaymentDate?: string;
  isPaid: boolean;
  paymentAttachment?: string;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Update {
  id: string;
  author: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Generic file operations
const readJsonFile = <T>(filePath: string): T[] => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = <T>(filePath: string, data: T[]): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
};

// Properties operations
export const getProperties = (): Property[] => {
  return readJsonFile<Property>(PROPERTIES_FILE);
};

export const getProperty = (id: string): Property | undefined => {
  const properties = getProperties();
  return properties.find((p) => p.id === id);
};

export const createProperty = (
  property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>
): Property => {
  const properties = getProperties();
  const newProperty: Property = {
    ...property,
    id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  properties.push(newProperty);
  writeJsonFile(PROPERTIES_FILE, properties);
  return newProperty;
};

export const updateProperty = (id: string, updates: Partial<Property>): Property | null => {
  const properties = getProperties();
  const index = properties.findIndex((p) => p.id === id);

  if (index === -1) return null;

  properties[index] = {
    ...properties[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(PROPERTIES_FILE, properties);
  return properties[index];
};

export const deleteProperty = (id: string): boolean => {
  const properties = getProperties();
  const filtered = properties.filter((p) => p.id !== id);

  if (filtered.length === properties.length) return false;

  writeJsonFile(PROPERTIES_FILE, filtered);
  return true;
};

// Tenants operations
export const getTenants = (): Tenant[] => {
  return readJsonFile<Tenant>(TENANTS_FILE);
};

export const getTenant = (id: string): Tenant | undefined => {
  const tenants = getTenants();
  return tenants.find((t) => t.id === id);
};

export const createTenant = (tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Tenant => {
  const tenants = getTenants();
  const newTenant: Tenant = {
    ...tenant,
    id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tenants.push(newTenant);
  writeJsonFile(TENANTS_FILE, tenants);
  return newTenant;
};

export const updateTenant = (id: string, updates: Partial<Tenant>): Tenant | null => {
  const tenants = getTenants();
  const index = tenants.findIndex((t) => t.id === id);

  if (index === -1) return null;

  tenants[index] = {
    ...tenants[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(TENANTS_FILE, tenants);
  return tenants[index];
};

export const deleteTenant = (id: string): boolean => {
  const tenants = getTenants();
  const filtered = tenants.filter((t) => t.id !== id);

  if (filtered.length === tenants.length) return false;

  writeJsonFile(TENANTS_FILE, filtered);
  return true;
};

// Updates operations
export const getUpdates = (): Update[] => {
  return readJsonFile<Update>(UPDATES_FILE);
};

export const getUpdate = (id: string): Update | undefined => {
  const updates = getUpdates();
  return updates.find((u) => u.id === id);
};

export const createUpdate = (update: Omit<Update, 'id' | 'createdAt' | 'updatedAt'>): Update => {
  const updates = getUpdates();
  const newUpdate: Update = {
    ...update,
    id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updates.push(newUpdate);
  writeJsonFile(UPDATES_FILE, updates);
  return newUpdate;
};

export const updateUpdate = (id: string, updates: Partial<Update>): Update | null => {
  const allUpdates = getUpdates();
  const index = allUpdates.findIndex((u) => u.id === id);

  if (index === -1) return null;

  allUpdates[index] = {
    ...allUpdates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(UPDATES_FILE, allUpdates);
  return allUpdates[index];
};

export const deleteUpdate = (id: string): boolean => {
  const updates = getUpdates();
  const filtered = updates.filter((u) => u.id !== id);

  if (filtered.length === updates.length) return false;

  writeJsonFile(UPDATES_FILE, filtered);
  return true;
};

// Image storage operations
export const saveImage = (imageBuffer: Buffer, filename: string): string => {
  const imagePath = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(imagePath, imageBuffer);
  return `/api/images/${filename}`;
};

export const getImagePath = (filename: string): string => {
  return path.join(IMAGES_DIR, filename);
};

export const deleteImage = (filename: string): boolean => {
  const imagePath = path.join(IMAGES_DIR, filename);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
    return true;
  }
  return false;
};

// Statistics
export const getStorageStats = () => {
  const properties = getProperties();
  const tenants = getTenants();
  const updates = getUpdates();

  const imageFiles = fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));

  return {
    properties: properties.length,
    tenants: tenants.length,
    updates: updates.length,
    images: imageFiles.length,
    totalSize: getDirectorySize(STORAGE_DIR),
  };
};

const getDirectorySize = (dirPath: string): number => {
  let totalSize = 0;

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }

  return totalSize;
};

// Export all operations
export const freeStorage = {
  properties: {
    getAll: getProperties,
    getById: getProperty,
    create: createProperty,
    update: updateProperty,
    delete: deleteProperty,
  },
  tenants: {
    getAll: getTenants,
    getById: getTenant,
    create: createTenant,
    update: updateTenant,
    delete: deleteTenant,
  },
  updates: {
    getAll: getUpdates,
    getById: getUpdate,
    create: createUpdate,
    update: updateUpdate,
    delete: deleteUpdate,
  },
  images: {
    save: saveImage,
    getPath: getImagePath,
    delete: deleteImage,
  },
  stats: getStorageStats,
};
