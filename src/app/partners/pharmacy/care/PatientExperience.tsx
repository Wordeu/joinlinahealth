'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BLUE, BLUE_SOFT, BLUE_WASH, BODY, CANVAS, INK, LINE, Mono } from './ui';
import styles from './PatientExperience.module.css';

const FEATURES = [
  {
    image: 'home',
    label: 'Their day',
    alt: 'Lina app homepage with personalised guidance and daily tracking',
    width: 640,
    height: 1137,
  },
  {
    image: 'recipes',
    label: 'Recipes',
    alt: 'Lina community recipes, with meal ideas and nutrition information',
    width: 480,
    height: 1001,
  },
  {
    image: 'lina-ai',
    label: 'Lina AI',
    alt: 'Lina AI voice conversation screen',
    width: 480,
    height: 853,
  },
  {
    image: 'micro-lessons',
    label: 'Micro-lessons',
    alt: 'A short Lina lesson about protein, fibre and water',
    width: 480,
    height: 1001,
  },
  {
    image: 'medical-tracking',
    label: 'Tracking',
    alt: 'Lina calendar for tracking medication doses and daily check-ins',
    width: 480,
    height: 853,
  },
];

function AppPreviews() {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const feature = FEATURES[selected];

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const move = (direction: number) => setSelected(index => (index + direction + FEATURES.length) % FEATURES.length);

  return (
    <>
      <div className={styles.appGallery} aria-label="Explore the Lina app">
        {FEATURES.map(({ image, label, alt, width, height }, index) => (
          <button
            key={image}
            type="button"
            className={styles.appPreview}
            aria-label={`Enlarge ${label} app preview`}
            aria-haspopup="dialog"
            onClick={() => { setSelected(index); setOpen(true); }}
          >
            <span className={styles.thumbnail}>
              <Image
                src={`/partners/pharmacy/app/${image}.webp`}
                alt={alt}
                width={width}
                height={height}
                sizes="(max-width: 639px) 100px, 160px"
                className={styles.thumbnailImage}
              />
            </span>
            <span className={styles.previewLabel}>{label}</span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="lina-app-preview-title"
        onClose={() => setOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <div>
              <Mono colour={BLUE} size={10}>The Lina app</Mono>
              <h3 id="lina-app-preview-title" className="mt-1 text-[19px] font-medium" style={{ color: INK }}>{feature.label}</h3>
            </div>
            <button type="button" autoFocus className={styles.galleryControl} aria-label="Close app preview" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 4 10 10M14 4 4 14" /></svg>
            </button>
          </div>
          {open && <Image
            key={feature.image}
            src={`/partners/pharmacy/app/${feature.image}.webp`}
            alt={feature.alt}
            width={feature.width}
            height={feature.height}
            sizes="320px"
            className={styles.expandedImage}
          />}
          <div className={styles.dialogFooter}>
            <button type="button" className={styles.galleryControl} aria-label="Previous app preview" onClick={() => move(-1)}>←</button>
            <span aria-live="polite" className="text-[12px]" style={{ color: BODY }}>{feature.label} · {selected + 1} / {FEATURES.length}</span>
            <button type="button" className={styles.galleryControl} aria-label="Next app preview" onClick={() => move(1)}>→</button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default function PatientExperience() {
  return (
    <div className="mt-5 sm:mt-6">
      <p className="max-w-[680px] text-[16px] leading-[1.65] sm:text-[18px]" style={{ color: BODY }}>
        Images and videos made for each patient, sent at the right time via WhatsApp. The same support, always there in their app.
      </p>

      <div className="mt-7 grid gap-3 lg:grid-cols-3">
        <article className={styles.supportCard}>
          <Mono colour={BLUE} size={10}>01 · Made for them</Mono>
          <h3 className="mt-3 text-[17px] font-medium tracking-[-.02em]" style={{ color: INK }}>Personalised images & videos</h3>
          <p className="mb-5 mt-2 text-[13px] leading-[1.7]" style={{ color: BODY }}>
            Their progress, their goals, their next step. Visual guidance shaped around where they are in treatment.
          </p>
          <div className="mt-auto grid min-h-[170px] grid-cols-2 gap-2" aria-label="Illustrative personalised image and video previews">
            <div className="flex flex-col justify-between border p-3" style={{ borderColor: BLUE_SOFT, background: BLUE_WASH }}>
              <Mono colour={BLUE} size={9}>Image · For Linda</Mono>
              <p className="my-3 text-[16px] leading-[1.3] tracking-[-.03em]" style={{ color: INK }}>Small steps.<br />Real progress.</p>
              <div className="flex h-8 items-end gap-1.5" aria-hidden="true">
                {[30, 45, 42, 65, 78, 100].map((height, i) => <span key={i} className="flex-1" style={{ height: `${height}%`, background: BLUE, opacity: 0.25 + i * 0.15 }} />)}
              </div>
            </div>
            <div className="flex flex-col justify-between border p-3" style={{ borderColor: LINE, background: CANVAS }}>
              <Mono colour={BLUE} size={9}>Video · For Linda</Mono>
              <svg viewBox="0 0 32 32" className="my-2 h-8 w-8" fill="none" stroke={BLUE} strokeWidth="1.2" aria-hidden="true">
                <rect x="1" y="1" width="30" height="30" />
                <path d="m13 10 9 6-9 6Z" fill={BLUE} stroke="none" />
              </svg>
              <p className="text-[12px] font-medium leading-[1.5]" style={{ color: INK }}>Your progress this month</p>
              <span className="mt-2 text-[10px]" style={{ color: BODY }}>A short personal update</span>
            </div>
          </div>
        </article>

        <article className={styles.supportCard}>
          <Mono colour={BLUE} size={10}>02 · Sent at the right time</Mono>
          <h3 className="mt-3 text-[17px] font-medium tracking-[-.02em]" style={{ color: INK }}>Straight to WhatsApp</h3>
          <p className="mb-5 mt-2 text-[13px] leading-[1.7]" style={{ color: BODY }}>
            Images, videos and check-ins arrive when they matter: starting treatment, reaching a milestone or preparing for a refill.
          </p>
          <div className="mt-auto min-h-[170px] border p-3" style={{ borderColor: LINE, background: CANVAS }}>
            <div className="flex items-center justify-between gap-2">
              <Mono colour={BLUE} size={9}>WhatsApp · Lina</Mono>
              <Mono size={9}>Example</Mono>
            </div>
            <div className="mt-3 border bg-white p-3" style={{ borderColor: LINE }}>
              <div className="mb-2 flex items-center gap-2 border-b pb-2 text-[10px]" style={{ borderColor: LINE, color: BLUE }}>
                <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true"><path d="m4 2 10 6-10 6Z" /></svg>
                Your personal progress video
              </div>
              <p className="text-[12px] leading-[1.6]" style={{ color: INK }}>Linda, your monthly update is ready. Here’s how far you’ve come.</p>
            </div>
          </div>
        </article>

        <article className={styles.supportCard}>
          <Mono colour={BLUE} size={10}>03 · A timely nudge</Mono>
          <h3 className="mt-3 text-[17px] font-medium tracking-[-.02em]" style={{ color: INK }}>Personal push notifications</h3>
          <p className="mb-5 mt-2 text-[13px] leading-[1.7]" style={{ color: BODY }}>
            Reminders and encouragement that fit their day, bringing them back to the right content in the app.
          </p>
          <div className="mt-auto flex min-h-[170px] flex-col justify-center border p-3" style={{ borderColor: LINE, background: CANVAS }}>
            <div className="border bg-white p-3" style={{ borderColor: LINE }}>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke={BLUE} strokeWidth="1.2" aria-hidden="true"><path d="M3 11h10l-1.5-2V6a3.5 3.5 0 0 0-7 0v3ZM6.5 13a1.5 1.5 0 0 0 3 0" /></svg>
                <Mono colour={BLUE} size={9}>Lina</Mono>
                <span className="ml-auto text-[9px]" style={{ color: BODY }}>now</span>
              </div>
              <p className="mt-3 text-[12px] font-medium" style={{ color: INK }}>Your weekly check-in, Linda</p>
              <p className="mt-1 text-[12px] leading-[1.6]" style={{ color: BODY }}>How are you feeling this week? Your next small step is ready.</p>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-6 grid items-center gap-5 border-y py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-8" style={{ borderColor: LINE }}>
        <div>
          <Mono colour={BLUE} size={10}>The Lina app</Mono>
          <h3 className="mt-2 text-[17px] font-medium tracking-[-.02em]" style={{ color: INK }}>The same support, in one place.</h3>
          <p className="mt-2 max-w-[420px] text-[13px] leading-[1.7]" style={{ color: BODY }}>
            Every personalised image and video is also in their app, alongside recipes, Lina AI, short lessons and treatment tracking.
          </p>
          <p className="mt-3 text-[11px]" style={{ color: BLUE }}>
            <span className={styles.hoverHint}>Hover for a closer look. Click to explore.</span>
            <span className={styles.touchHint}>Tap a screen for a closer look.</span>
          </p>
        </div>
        <AppPreviews />
      </div>

      <div className="mt-5">
        <Mono colour={BLUE} size={10}>Built with clinical and behavioural expertise</Mono>
        <p className="mt-2 max-w-[920px] text-[13px] leading-[1.8]" style={{ color: BODY }}>
          Developed with a doctor from <span className="font-medium" style={{ color: INK }}>Johns Hopkins University</span>,
          with direction from a director of biobehavioural research at{' '}
          <span className="font-medium" style={{ color: INK }}>Sanford Medical</span>.
        </p>
      </div>
    </div>
  );
}
