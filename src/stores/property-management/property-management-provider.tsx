"use client";

import { ReactNode } from "react";

interface PropertyManagementProviderProps {
  children: ReactNode;
}

export function PropertyManagementProvider({ children }: PropertyManagementProviderProps) {
  // The store is already initialized when imported
  // This provider can be used for future enhancements like persistence, etc.
  return <>{children}</>;
}
