'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function IndustryList({ children }: { children: ReactNode }) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function openLinkedExample() {
      const target = document.getElementById(window.location.hash.slice(1));
      const panel = target?.closest('details');
      if (panel && list.current?.contains(panel) && !panel.open) {
        panel.open = true;
        panel.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }
    openLinkedExample();
    window.addEventListener('hashchange', openLinkedExample);
    return () => window.removeEventListener('hashchange', openLinkedExample);
  }, []);
  return (
    <div className="industry-list" ref={list}>
      {children}
    </div>
  );
}
