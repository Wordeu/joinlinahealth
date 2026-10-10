import type { Metadata } from 'next';

export const PHARMACY_TITLE = 'The patient experience behind better retention | Lina';
export const PHARMACY_DESCRIPTION = 'Lina uses AI-powered simulations to turn your patient data into timely, personalised follow-ups that keep patients engaged and revenue growing.';
const SITE_URL = 'https://joinlinahealth.com';
const SOCIAL_IMAGE = `${SITE_URL}/partners/pharmacy/social-card`;

export function buildPharmacyMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: PHARMACY_TITLE,
    description: PHARMACY_DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/` },
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: 'Lina',
      locale: 'en_GB',
      title: PHARMACY_TITLE,
      description: PHARMACY_DESCRIPTION,
      url: `${SITE_URL}/`,
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: 'Lina — The patient experience behind better retention' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: PHARMACY_TITLE,
      description: PHARMACY_DESCRIPTION,
      images: [{ url: SOCIAL_IMAGE, alt: 'Lina — The patient experience behind better retention' }],
    },
  };
}
