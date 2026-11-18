import type { ReactNode } from 'react';
import Link from 'next/link';

export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <span className={'arrow' + (down ? ' down' : '')} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12h15m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Action({
  href,
  children,
  kind = 'dark',
}: {
  href: string;
  children: ReactNode;
  kind?: 'dark' | 'amber' | 'text';
}) {
  return (
    <Link prefetch={false} href={href} className={'action action-' + kind}>
      {children}
      <Arrow />
    </Link>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function PageIntro({
  label,
  title,
  text,
  children,
}: {
  label: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-intro wrap">
      <Eyebrow>{label}</Eyebrow>
      <h1>{title}</h1>
      <p className="intro-text">{text}</p>
      {children}
    </header>
  );
}

export function CloseSection() {
  return (
    <section className="compact-invite">
      <div className="wrap invite-inner">
        <div>
          <h2>Tell us what needs fixing.</h2>
          <p>We’ll talk it through, then outline the work and costs for you to review.</p>
        </div>
        <Action href="/contact/">Request a project outline</Action>
      </div>
    </section>
  );
}
