'use client';

import React from 'react';
// Import from our compatibility layer instead of directly from antd
import { StyleProvider } from '../lib/antd-compat';

interface AntDesignProviderProps {
  children: React.ReactNode;
}

export default function AntDesignProvider({ children }: AntDesignProviderProps) {
  return (
    <StyleProvider hashPriority="high">
      {children}
    </StyleProvider>
  );
}
