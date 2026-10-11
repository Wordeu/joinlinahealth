import { NextRequest, NextResponse } from 'next/server';

// Keep the existing signup destination without sharing database credentials.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const email = typeof body === 'object' && body !== null && 'email' in body && typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://findlina.com/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'lina-care-waitlist' }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok || (await response.json()).success !== true) {
      throw new Error('Signup service unavailable');
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Could not save your email. Please try again.' }, { status: 502 });
  }
}
