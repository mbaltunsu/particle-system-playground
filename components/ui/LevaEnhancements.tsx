'use client';

import { useEffect } from 'react';

export default function LevaEnhancements() {
  useEffect(() => {
    const container = document.querySelector('[data-leva-theme]');
    if (!container) return;

    const addTooltips = () => {
      const labels = container.querySelectorAll('label');
      labels.forEach((label) => {
        if (!label.title && label.textContent) {
          label.title = label.textContent;
        }
      });
    };

    // Initial pass
    addTooltips();

    // Watch for new labels added dynamically (folders opening/closing)
    const observer = new MutationObserver(() => {
      requestAnimationFrame(addTooltips);
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
