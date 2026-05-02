'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { NetworkProvider } from '@/components/providers/NetworkProvider';
import GlobalNavigationHotkeys from '@/components/GlobalNavigationHotkeys';
import { CommandPaletteMount } from '@/components/shared/CommandPalette';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <NetworkProvider>
          <GlobalNavigationHotkeys />
          <CommandPaletteMount />
          {children}
        </NetworkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
