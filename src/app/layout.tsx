import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import CookieBanner from './components/CookieBanner';
import { buildPharmacyMetadata } from './partners/pharmacy/metadata';
import './globals.css';

export const metadata = {
  ...buildPharmacyMetadata(),
  icons: {
    icon: 'https://res.cloudinary.com/dy957v1wp/image/upload/w_48,h_48/v1778583457/favicon_pvsfpp.png',
    apple: 'https://res.cloudinary.com/dy957v1wp/image/upload/w_180,h_180/v1778583457/favicon_pvsfpp.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-ZD20HWRH07" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-ZD20HWRH07');`}
        </Script>
      </head>
      <body>
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
