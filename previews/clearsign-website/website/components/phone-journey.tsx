'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const chapters = [
  ['business-story', 'The demo'],
  ['your-business', 'Your needs'],
  ['bottlenecks', 'Your time'],
  ['business-needs', 'Next step'],
] as const;

export default function PhoneJourney() {
  const navigation = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState('');
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 760px)');
    const sections = chapters.map(([id]) => document.getElementById(id));
    let frame = 0;
    function update() {
      frame = 0;
      const readingLine =
        (navigation.current?.offsetHeight || 0) + Math.min(104, window.innerHeight / 6);
      let active = '';
      for (const section of sections) {
        if (section && section.getBoundingClientRect().top <= readingLine) active = section.id;
      }
      setCurrent(active);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    function detach() {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    function sync() {
      detach();
      if (phone.matches) {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        schedule();
      }
    }
    sync();
    phone.addEventListener('change', sync);
    return () => {
      detach();
      phone.removeEventListener('change', sync);
    };
  }, []);
  return (
    <nav className="phone-journey" aria-label="On this page" ref={navigation}>
      <div className="wrap">
        {chapters.map(([id, text]) => (
          <Link
            prefetch={false}
            key={id}
            href={'/#' + id}
            aria-current={current === id ? 'location' : undefined}
          >
            {text}
          </Link>
        ))}
      </div>
    </nav>
  );
}
