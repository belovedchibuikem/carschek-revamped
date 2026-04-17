'use client';

import React, { createContext, useCallback, useContext } from 'react';

const InspectorRouteContext = createContext<string>('/inspector');

export function InspectorRouteProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  const normalized = basePath.replace(/\/$/, '') || '/inspector';
  return <InspectorRouteContext.Provider value={normalized}>{children}</InspectorRouteContext.Provider>;
}

export function useInspectorBasePath(): string {
  return useContext(InspectorRouteContext);
}

/** Build an absolute app path under the inspector or inspector-app tree. */
export function useInspectorHref(): (suffix: string) => string {
  const base = useInspectorBasePath();
  return useCallback(
    (suffix: string) => {
      const s = suffix.replace(/^\//, '');
      return `${base}/${s}`;
    },
    [base]
  );
}
