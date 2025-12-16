"use client";

import { useEffect } from 'react';
import { Providers } from "./AppWrapper";
import Header from "./Header";
import Footer from "./Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Cleanup script для удаления атрибутов расширений браузера
  useEffect(() => {
    function removeExtensionAttributes() {
      const elements = document.querySelectorAll('[bis_skin_checked], [bis_register]');
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked');
        element.removeAttribute('bis_register');
      });
    }

    removeExtensionAttributes();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (target.hasAttribute('bis_skin_checked') || target.hasAttribute('bis_register')) {
            target.removeAttribute('bis_skin_checked');
            target.removeAttribute('bis_register');
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', 'bis_register']
    });

    const interval = setInterval(removeExtensionAttributes, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <Providers>
      <div className="relative overflow-x-hidden">
        <Header />
        <main className="container py-8">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  );
}

