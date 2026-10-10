'use client';

import { useEffect, useRef, useState } from 'react';

const CONSENT_KEY = 'lina-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bannerRef = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!visible || !bannerRef.current) return;
    const banner = bannerRef.current;
    const measure = () => setHeight(banner.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(banner);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(CONSENT_KEY) !== 'accepted');
    } catch {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {
      // The banner should still dismiss when storage is unavailable.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
    <div aria-hidden="true" style={{ height }} />
    <aside
      ref={bannerRef}
      className="fixed inset-x-0 bottom-0 z-[60] max-h-[50dvh] overflow-y-auto border-t border-[#D9D9D9] bg-white pb-[env(safe-area-inset-bottom)] text-[#202124] shadow-[0_-2px_8px_rgba(0,0,0,.04)]"
      aria-label="Cookie consent"
    >
      {expanded ? (
        <div id="cookie-details" className="mx-auto max-w-[1220px] px-5 pb-1 pt-4 text-[13px] leading-relaxed text-[#5F6368]">
          Lina uses optional cookies for analytics, ads and referrals, company insights, and embedded content. You can change
          your choice at any time in Preferences.
        </div>
      ) : null}
      <div className="mx-auto flex max-w-[1220px] flex-col items-stretch gap-2 px-5 py-3 md:flex-row md:items-center md:gap-8 md:py-2">
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[#5F6368]">
          Optional cookies for analytics, ads/referrals, company insights and embedded content. Your choice.{' '}
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-block min-h-11 px-1 align-baseline text-[13px] font-medium text-[#1264E8] underline decoration-1 underline-offset-2 hover:text-[#0B4EBC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-expanded={expanded}
          aria-controls="cookie-details"
        >
          Details
        </button>
        </p>
        <div className="flex shrink-0 items-center justify-end gap-5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-h-11 shrink-0 px-1 text-[13px] font-medium text-[#202124] underline decoration-1 underline-offset-2 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-expanded={expanded}
          aria-controls="cookie-details"
        >
          Preferences
        </button>
        <button
          type="button"
          onClick={acceptCookies}
          className="min-h-11 shrink-0 bg-[#1264E8] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0B4EBC] focus:outline-none focus:ring-2 focus:ring-[#1264E8] focus:ring-offset-2"
        >
          Accept all
        </button>
        </div>
      </div>
    </aside>
    </>
  );
}
