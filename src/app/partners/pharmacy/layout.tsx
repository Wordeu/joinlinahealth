import { buildPharmacyMetadata } from './metadata';

export const metadata = buildPharmacyMetadata();

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
