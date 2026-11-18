'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const entries = [
  ['/solutions/', 'Services'],
  ['/industries/', 'Who we help'],
  ['/about/', 'About'],
  ['/demo/', 'Phone demo'],
] as const;

export default function Navigation() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);
  useEffect(() => {
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        trigger.current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (menu.current?.open && !menu.current.contains(event.target as Node))
        menu.current.open = false;
    }
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
    };
  }, []);
  const current = (href: string) => pathname?.replace(/\/$/, '') === href.replace(/\/$/, '');
  const links = entries.map(([href, text]) => (
    <Link prefetch={false} key={href} href={href} aria-current={current(href) ? 'page' : undefined}>
      {text}
    </Link>
  ));
  return (
    <>
      <a
        className="skip"
        href="#main-content"
        onClick={(event) => {
          const main = document.getElementById('main-content');
          if (!main) return;
          event.preventDefault();
          main.focus({ preventScroll: true });
          main.scrollIntoView({ block: 'start', behavior: 'instant' });
        }}
      >
        Skip to content
      </a>
      <header className="mast">
        <div className="wrap mast-inner">
          <Link prefetch={false} className="logo" href="/" aria-label="ClearSign home">
            <img src="/assets/brand/wordmark-light.svg" alt="ClearSign" width="302" height="64" />
          </Link>
          <nav className="desk-nav" aria-label="Main navigation">
            {links}
            <Link
              prefetch={false}
              className="nav-contact"
              href="/contact/"
              aria-current={current('/contact/') ? 'page' : undefined}
            >
              Get in touch <span aria-hidden="true">↗</span>
            </Link>
          </nav>
          <details className="phone-menu" ref={menu}>
            <summary ref={trigger}>
              Menu <span className="menu-lines" aria-hidden="true" />
            </summary>
            <nav
              aria-label="Mobile navigation"
              onClick={() => {
                if (menu.current) menu.current.open = false;
              }}
            >
              {links}
              <Link
                prefetch={false}
                href="/contact/"
                aria-current={current('/contact/') ? 'page' : undefined}
              >
                Get in touch <span aria-hidden="true">↗</span>
              </Link>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
