"use client";

import { Providers } from "./components/AppWrapper";
import AppShell from "./components/AppShell";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppShell>
        {children}
      </AppShell>
    </Providers>
  );
}

