import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Navigation from '../components/navigation';
import './globals.css';
import './disclosure-motion.css';
import './studio.css';
import './phone-journey.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://clearsign.uk'),
  title: {
    default: 'ClearSign Solutions | Websites, branding and business software',
    template: '%s | ClearSign Solutions',
  },
  description:
    'Our Birmingham team builds websites, designs brands and makes software that cuts everyday admin for small and medium-sized businesses.',
  openGraph: {
    siteName: 'ClearSign Solutions',
    type: 'website',
    locale: 'en_GB',
    images: [
      {
        url: '/assets/brand/sizes/clearsign-ivory-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'ClearSign Solutions',
      },
    ],
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/assets/icons/apple-touch-icon.png',
  },
};
export const viewport: Viewport = { themeColor: '#f7f6f2', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link
          rel="preload"
          href="/assets/fonts/archivo-latin-wght.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Navigation />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <div className="wrap foot-grid">
            <div>
              <Link prefetch={false} className="logo" href="/" aria-label="ClearSign home">
                <img
                  src="/assets/brand/wordmark-dark.svg"
                  alt="ClearSign"
                  width="302"
                  height="64"
                />
              </Link>
              <p>Business solutions from Birmingham, UK.</p>
            </div>
            <nav aria-label="Footer navigation">
              <Link prefetch={false} href="/solutions/">
                Services
              </Link>
              <Link prefetch={false} href="/industries/">
                Who we help
              </Link>
              <Link prefetch={false} href="/about/">
                About
              </Link>
              <Link prefetch={false} href="/demo/">
                Phone assistant demo
              </Link>
              <Link prefetch={false} href="/contact/">
                Contact
              </Link>
            </nav>
            <div className="foot-end">
              <a href="mailto:info@clearsign.uk">info@clearsign.uk</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
