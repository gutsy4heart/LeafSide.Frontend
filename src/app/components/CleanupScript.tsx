'use client';

import { useEffect } from 'react';

export default function CleanupScript() {
  useEffect(() => {
    function removeExtensionAttributes() {
      const elements = document.querySelectorAll('[bis_skin_checked], [bis_register]');
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked');
        element.removeAttribute('bis_register');
      });
    }
    
    // Run immediately
    removeExtensionAttributes();
    
    // Set up observer
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
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
    
    // Periodic cleanup
    const interval = setInterval(removeExtensionAttributes, 50);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}

