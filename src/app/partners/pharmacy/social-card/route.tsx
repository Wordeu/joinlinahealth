import { ImageResponse } from 'next/og';
import { PHARMACY_DESCRIPTION } from '../metadata';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '56px 64px', background: '#FFFFFF', color: '#0C1116', fontFamily: 'sans-serif', borderTop: '8px solid #2563EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 36, fontWeight: 700 }}>Lina</div>
          <div style={{ display: 'flex', fontSize: 21, color: '#2563EB' }}>For pharmacies and online GLP-1 providers</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 60, fontSize: 67, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-2px' }}>
          <span>The patient experience</span>
          <span>behind better retention</span>
        </div>
        <div style={{ display: 'flex', marginTop: 32, fontSize: 27, lineHeight: 1.5, color: '#5F6B76' }}>
          {PHARMACY_DESCRIPTION}
        </div>
        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 21, color: '#2563EB' }}>joinlinahealth.com</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
