'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './care/refinements.css';

import CareEngine from './care/CareEngine';
import CareGap from './care/CareGap';
import Commercial from './care/Commercial';
import DataDimensions from './care/DataDimensions';
import HeroSystem from './care/HeroSystem';
import PatientExperience from './care/PatientExperience';
import ProviderList from './care/ProviderList';
import RecurringCare from './care/RecurringCare';
import ScrollScene from './care/ScrollScene';
import { PROVIDER } from './care/data';
import {
  Avatar,
  BLUE,
  BLUE_DEEP,
  BLUE_WASH,
  BODY,
  CANVAS,
  Chip,
  FAINT,
  INK,
  LINE,
  LINE_SOFT,
  MONO,
  MUTED,
  Mono,
  PAPER,
  Rect,
  Reveal,
  SectionShell,
  useReducedMotion,
} from './care/ui';

const BOOK_A_DEMO = 'https://cal.com/linahealth/15-min-meeting';
const CONTACT = 'mailto:hello@findlina.com?subject=Pharmacy%20show%20discount%20or%20partnership';
const LOGO = '/partners/pharmacy/lina-logo.png';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#for-patients', label: 'For patients' },
  { href: '#for-providers', label: 'For providers' },
  { href: '#team', label: 'Team' },
];

/* ── Buttons ────────────────────────────────────────────────────────── */

function Solid({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-11 items-center justify-center px-4 py-2 text-[13px] font-medium text-white transition-colors ${className}`}
      style={{ background: BLUE }}
      onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DEEP)}
      onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
    >
      {children}
    </a>
  );
}

function Outline({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-11 items-center justify-center bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-[#F1F5FE] ${className}`}
      style={{ color: BLUE, boxShadow: `inset 0 0 0 1px ${BLUE}` }}
    >
      {children}
    </a>
  );
}

function OutlineButton({ onClick, children, className = '' }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-[#F1F5FE] ${className}`}
      style={{ color: BLUE, boxShadow: `inset 0 0 0 1px ${BLUE}` }}
    >
      {children}
    </button>
  );
}

/* ── Lead capture ──────────────────────────────────────────────────── */

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'lina-care-waitlist' }),
      });
      setStatus(response.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/35 px-4 py-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="waitlist-modal-title" onClick={onClose}>
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[440px] overflow-y-auto border bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,.18)] sm:p-8" style={{ borderColor: LINE }} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center border text-lg font-light leading-none transition-colors hover:bg-[#F4F5F7]"
          style={{ borderColor: LINE, color: MUTED }}
        >
          ×
        </button>

        {status === 'success' ? (
          <div className="pr-8">
            <Mono colour={BLUE}>On the waitlist</Mono>
            <h2 id="waitlist-modal-title" className="mt-4 text-[24px] font-normal leading-[1.2] tracking-[-.03em]" style={{ color: INK }}>
              Thanks, we’ll be in touch.
            </h2>
            <p className="mt-3 text-[13.5px] leading-[1.65]" style={{ color: BODY }}>
              We’ll write when there is something worth looking at, and we’d like to hear what would make it useful on your side of the counter.
            </p>
          </div>
        ) : (
          <>
            <div className="pr-8">
              <Mono colour={BLUE}>Join the waitlist</Mono>
              <h2 id="waitlist-modal-title" className="mt-4 text-[24px] font-normal leading-[1.2] tracking-[-.03em]" style={{ color: INK }}>
                Leave an email.
              </h2>
              <p className="mt-3 text-[13.5px] leading-[1.65]" style={{ color: BODY }}>
                We’re working with a small number of pharmacies and online providers first.
              </p>
            </div>
            <form onSubmit={submit} className="mt-6">
              <label htmlFor="care-waitlist-email">
                <Mono>Work email</Mono>
              </label>
              <input
                id="care-waitlist-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@yourpharmacy.com"
                className="mt-2.5 h-11 w-full border bg-white px-3 text-[16px] outline-none transition-shadow placeholder:text-[#A8B0B8] focus:ring-2 focus:ring-[#2563EB]/25 sm:text-[13.5px]"
                style={{ borderColor: LINE, color: INK }}
              />
              {status === 'error' ? (
                <p className="mt-2 text-[12px]" style={{ color: '#BA3A2E' }}>
                  That didn’t go through. Try again.
                </p>
              ) : null}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex min-h-11 items-center justify-center px-4 text-[12.5px] font-medium text-white transition-colors disabled:cursor-wait disabled:opacity-60"
                  style={{ background: BLUE }}
                >
                  {status === 'submitting' ? 'Sending…' : 'Join the waitlist'}
                </button>
              </div>
              <p className="mt-4 text-[11.5px] leading-[1.55]" style={{ color: FAINT }}>
                Only used to follow up about Lina.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

type HeroParticle = {
  id: number;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  duration: number;
};

function ParticleHeroField({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<HeroParticle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const nextId = useRef(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const cursorPoint = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useReducedMotion();

  const spawnParticles = useCallback((x: number, y: number) => {
    if (reducedMotion) return;
    const burst = Math.random() > 0.24 ? 3 : 4;
    const additions = Array.from({ length: burst }, (_, index) => ({
      id: nextId.current++,
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      size: 3.5 + Math.random() * 2.5,
      dx: (Math.random() - 0.5) * 52,
      dy: -12 + (Math.random() - 0.5) * 52,
      duration: 2700 + index * 80 + Math.random() * 420,
    }));

    setParticles((current) => [...current, ...additions].slice(-64));
  }, [reducedMotion]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const previous = lastPoint.current;
    cursorPoint.current = { x, y };
    setIsHovered(true);

    if (previous && Math.hypot(x - previous.x, y - previous.y) < 8) return;
    lastPoint.current = { x, y };
    spawnParticles(x, y);
  }, [reducedMotion, spawnParticles]);

  useEffect(() => {
    if (!isHovered || reducedMotion) return;

    const emitter = window.setInterval(() => {
      const point = cursorPoint.current;
      if (point) spawnParticles(point.x, point.y);
    }, 125);

    return () => window.clearInterval(emitter);
  }, [isHovered, reducedMotion, spawnParticles]);

  const removeParticle = useCallback((id: number) => {
    setParticles((current) => current.filter((particle) => particle.id !== id));
  }, []);

  return (
    <div
      className="relative max-w-[920px] overflow-hidden"
      onPointerEnter={handlePointerMove}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setIsHovered(false);
        lastPoint.current = null;
        cursorPoint.current = null;
      }}
    >
      {children}
      <span className="pointer-events-none absolute inset-0" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="care-hero-particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}ms`,
              ['--particle-dx' as string]: `${particle.dx}px`,
              ['--particle-dy' as string]: `${particle.dy}px`,
            }}
            onAnimationEnd={() => removeParticle(particle.id)}
          />
        ))}
      </span>
    </div>
  );
}

/* ── Team ───────────────────────────────────────────────────────────── */

const PEOPLE = [
  {
    name: 'Johnny Wordsworth',
    role: 'Growth, product and healthcare infrastructure',
    image: '/partners/pharmacy/johnny-wordsworth.png',
    linkedin: 'https://www.linkedin.com/in/johnnywordsworth/',
    short:
      'Johnny built the growth function at Clarity, an AI customer experience startup, helping it grow from 4 to 45 people and from $0 to $2m ARR alongside a $12m raise',
    long: 'Johnny built the growth and marketing function at Clarity, an AI customer experience startup, helping it grow from 4 to 45 people and from $0 to $2m ARR alongside a $12m raise, with customers including OpenAI and Booking.com. He founded PromptStacks, grew it to 21,000 users and sold it to Semrush. He then started Lina with a Johns Hopkins assistant professor and reached more than 1,000 patients before moving into healthcare infrastructure.',
  },
  {
    name: 'Emilian Popa',
    role: 'Diagnostics, clinics and health software',
    image: '/partners/pharmacy/emilian-popa.png',
    linkedin: 'https://www.linkedin.com/in/emilianpopa/',
    short:
      'Co-founded Ilara Health, bringing accurate, affordable, AI-powered diagnostics to 500,000+ patients across four countries in sub-Saharan Africa; raised $13m+ from leading investors.',
    long: 'Emilian spent 7 years building Ilara Health after roles at Rocket Internet Asia, Jumia Africa, a Naspers backed startup and a growth stage tech fund. Ilara raised $12m and brought diagnostics to more than 1,000 clinics and pharmacies across Kenya. He has since built longevity clinics in Cape Town and Bucharest, along with Expand Health AI, the software they run on, now used by paying clinics.',
  },
  {
    name: 'Dr Danna Kashlan, MD',
    role: 'Founding Medical Advisor',
    image: '/partners/pharmacy/danna-kashlan.png',
    short:
      "I'm an internal and obesity medicine physician and Assistant Professor at Johns Hopkins. My clinical work focuses on evidence-based obesity treatment, and I'm the founding medical advisor at Lina, where I review all content.",
    long:
      "I'm an internal and obesity medicine physician and Assistant Professor at Johns Hopkins. My clinical work focuses on evidence-based obesity treatment, and I'm the founding medical advisor at Lina, where I review all content.",
  },
];

function Person({ person }: { person: (typeof PEOPLE)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <Rect>
      <div className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-x-3 gap-y-4 p-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-x-4 sm:p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={person.image} alt={person.name} className="h-12 w-12 object-cover grayscale sm:h-16 sm:w-16" style={{ aspectRatio: '1 / 1' }} />
        <div className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-semibold tracking-[-.01em]" style={{ color: INK }}>
            {person.name}
          </span>
          <Mono size={9} colour={FAINT} className="mt-1.5">
            {person.role}
          </Mono>
        </div>
        <span className="col-span-2 block text-[13px] leading-[1.7]" style={{ color: BODY }}>
          {person.short}
        </span>
        <div className="col-span-2 flex items-center justify-end gap-2">
          {person.linkedin ? (
            <a
              href={person.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${person.name} on LinkedIn`}
              className="grid h-11 w-11 place-items-center transition-opacity hover:opacity-60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/partners/pharmacy/linkedin-black-logo.svg" alt="" aria-hidden="true" className="h-5 w-5" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? 'Hide' : 'Show'} more about ${person.name}`}
            className="grid h-11 w-11 place-items-center border text-[16px] font-light transition-transform duration-300"
            style={{ borderColor: LINE, color: MUTED, background: PAPER, transform: open ? 'rotate(45deg)' : 'none', lineHeight: 1 }}
          >
            +
          </button>
        </div>
      </div>
      <div
        className="grid px-4 transition-[grid-template-rows,opacity] duration-300 ease-out sm:px-5"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[13px] leading-[1.7]" style={{ color: BODY }}>
            {person.long}
          </p>
        </div>
      </div>
    </Rect>
  );
}

/* ── Final CTA preview ──────────────────────────────────────────────── */

const CTA_STATES = [
  { label: 'Record', title: 'Linda, 51 · month 4', body: 'New scan on file. Weight −9.0 kg.' },
  { label: 'Intervention', title: 'Four-month review prepared', body: 'Built from her two scans. Approved pathway.' },
  { label: 'Interaction', title: 'Watched, then replied', body: 'Asked to book a conversation about strength.' },
];

function CtaPreview() {
  const [i, setI] = useState(0);

  return (
    <div data-scene-step={i} className="border bg-white" style={{ borderColor: LINE }}>
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
        <Mono size={9} colour={BODY}>
          {PROVIDER}
        </Mono>
        <div className="flex gap-1">
          {CTA_STATES.map((s, n) => (
            <button key={s.label} type="button" aria-label={`Show ${s.label}`} aria-pressed={n === i} title={s.label}
              onClick={() => setI(n)} className="grid h-8 w-8 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: BLUE }}>
              <span className="h-[3px] w-5 transition-colors duration-300" style={{ background: n === i ? BLUE : LINE }} />
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <Mono size={9} colour={BLUE}>
          {CTA_STATES[i].label}
        </Mono>
        <div className="mt-3 flex items-start gap-3">
          <Avatar initials="LH" size={30} active />
          <div key={i} className="care-fade min-h-[46px]">
            <p className="text-[13.5px] font-semibold leading-tight" style={{ color: INK }}>
              {CTA_STATES[i].title}
            </p>
            <p className="mt-1.5 text-[12px] leading-[1.5]" style={{ color: BODY }}>
              {CTA_STATES[i].body}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t pt-3" style={{ borderColor: LINE_SOFT }}>
          {['Read', 'Detect', 'Decide', 'Deliver', 'Learn'].map((s, n) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="text-[9px] transition-colors duration-300"
                style={{ fontFamily: MONO, letterSpacing: '.06em', color: n <= [0, 2, 4][i] ? BLUE : FAINT }}
              >
                {s}
              </span>
              {n < 4 ? <span className="h-px w-2" style={{ background: LINE }} /> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const PARTNER_POINTS = [
  'Connect the patient data you already hold',
  'Map what actually happens between prescriptions',
  'Agree the moments worth a message',
  'Run the communications under your brand',
  'Measure what the care journey changes',
  'Direct access to both founders',
];

/* ── Page ───────────────────────────────────────────────────────────── */

export default function LinaCarePage() {
  const [scrolled, setScrolled] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openWaitlist = useCallback(() => setWaitlistOpen(true), []);
  const closeWaitlist = useCallback(() => setWaitlistOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html { scroll-behavior: smooth; }
            .care-scrub { -webkit-appearance: none; appearance: none; outline: none; }
            .care-scrub::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; background: ${BLUE}; border: 2px solid #fff; box-shadow: 0 0 0 1px ${BLUE}; cursor: pointer; }
            .care-scrub::-moz-range-thumb { width: 10px; height: 10px; background: ${BLUE}; border: 2px solid #fff; box-shadow: 0 0 0 1px ${BLUE}; border-radius: 0; cursor: pointer; }
            .care-scrub:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 1px ${BLUE}, 0 0 0 4px ${BLUE_WASH}; }
            @keyframes care-fade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
            .care-fade { animation: care-fade .4s cubic-bezier(.22,.61,.36,1) both; }
            @keyframes care-hero-particle {
              0% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(.45) rotate(0deg); }
              15% { opacity: .76; }
              100% { opacity: 0; transform: translate3d(calc(-50% + var(--particle-dx)), calc(-50% + var(--particle-dy)), 0) scale(.86); }
            }
            .care-hero-particle {
              position: absolute;
              display: block;
              border: 0;
              border-radius: 0;
              background: ${BLUE};
              box-shadow: none;
              animation: care-hero-particle 3s cubic-bezier(.22,.61,.36,1) both;
              will-change: transform, opacity;
            }
            .care-logo {
              display: block;
              background: ${INK};
              -webkit-mask: url('${LOGO}') center / contain no-repeat;
              mask: url('${LOGO}') center / contain no-repeat;
              transition: background-color .2s ease;
            }
            .care-logo:hover { background: ${BLUE}; }
            @media (prefers-reduced-motion: reduce) {
              html { scroll-behavior: auto; }
              .care-fade { animation: none; }
              *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
            }
          `,
        }}
      />

      <div className="care-page min-h-screen bg-white antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <header
          className="fixed inset-x-0 top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow"
          style={{ borderColor: LINE, boxShadow: scrolled ? '0 1px 10px rgba(12,17,22,.05)' : 'none' }}
        >
          <div className="mx-auto flex h-[58px] max-w-[1220px] items-center justify-between gap-3 px-5">
            <a href="#top" onClick={() => setMenuOpen(false)} className="flex min-h-11 flex-none items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="care-logo h-[24px] w-[64px] flex-none" role="img" aria-label="Lina" />
            </a>

            <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex lg:gap-7">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-[13.5px] transition-colors hover:text-black" style={{ color: BODY }}>
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-none items-center gap-2">
              <Outline href={CONTACT} className="hidden sm:inline-flex !px-3 !py-1.5 !text-[12.5px]">
                Contact
              </Outline>
              <Solid href={BOOK_A_DEMO} className="!px-3 !py-1.5 !text-[12.5px]">Book a demo</Solid>
              <button type="button" className="grid h-11 w-11 place-items-center border lg:hidden" style={{ borderColor: LINE, color: INK }} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="care-mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d={menuOpen ? 'M6 6l12 12M6 18 18 6' : 'M4 7h16M4 12h16M4 17h16'} />
                </svg>
              </button>
            </div>
          </div>
          {menuOpen ? (
            <nav id="care-mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full border-b bg-white px-5 py-3 shadow-sm lg:hidden" style={{ borderColor: LINE }} onKeyDown={(event) => { if (event.key === 'Escape') setMenuOpen(false); }}>
              {NAV_LINKS.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center border-b text-[14px]" style={{ color: BODY, borderColor: LINE_SOFT }}>{link.label}</a>)}
              <a href={CONTACT} className="flex min-h-11 items-center text-[14px]" style={{ color: BLUE }}>Contact</a>
            </nav>
          ) : null}
        </header>

        <main id="top" className="pt-[58px]">
          {/* ── 01 Hero ──────────────────────────────────────── */}
          <section className="px-5 pb-8 pt-12 sm:pb-10 sm:pt-20 lg:pt-24">
            <div className="mx-auto max-w-[1180px]">
              <ParticleHeroField>
                <Reveal>
                  <div className="flex items-center gap-3">
                    <Mono colour={FAINT}>001</Mono>
                    <Mono colour={BLUE}>For pharmacies and online GLP-1 providers</Mono>
                  </div>
                </Reveal>

                <Reveal delay={60}>
                  <h1
                    className="mt-5 text-[clamp(1.875rem,8.8vw,3.5rem)] font-normal leading-[1.1] tracking-[-.035em] sm:mt-6"
                    style={{ color: INK }}
                  >
                    <span className="block">The patient experience</span>
                    <span className="block">behind better retention</span>
                  </h1>
                </Reveal>

                <Reveal delay={110}>
                  <p className="mt-5 max-w-[620px] text-[15px] leading-[1.7] sm:mt-6 sm:text-[17px]" style={{ color: BODY }}>
                    Lina uses AI-powered simulations to turn your patient data into timely, personalised follow-ups that keep
                    patients engaged and revenue growing.
                  </p>
                </Reveal>

                <Reveal delay={160}>
                  <div className="mt-7 flex flex-wrap items-center gap-2.5">
                    <Solid href={BOOK_A_DEMO}>Book a demo</Solid>
                    <OutlineButton onClick={openWaitlist}>Join the waitlist</OutlineButton>
                  </div>
                </Reveal>
              </ParticleHeroField>
            </div>
          </section>

          <section className="px-5 pb-12 sm:pb-16 lg:pb-20">
            <div className="mx-auto max-w-[1180px]">
              <HeroSystem />
            </div>
          </section>

          {/* ── 02 The gap ───────────────────────────────────── */}
          <SectionShell
            id="the-gap"
            bare
          >
            <CareGap />
          </SectionShell>

          {/* ── 03 How it works ──────────────────────────────── */}
          <SectionShell
            id="how-it-works"
            bare
          >
            <CareEngine />
          </SectionShell>

          {/* ── 04 The patient ───────────────────────────────── */}
          <SectionShell
            id="for-patients"
            index="004"
            title="What the patient gets"
          >
            <PatientExperience />
          </SectionShell>

          {/* ── 05 The provider ──────────────────────────────── */}
          <SectionShell
            id="for-providers"
            bare
          >
            <ScrollScene name="provider" pin={false} beats={5} panels index="005" title="What your pharmacy sees">
              {({ progress }) => <ProviderList progress={progress} />}
            </ScrollScene>
          </SectionShell>

          {/* ── 06 Beyond the scale ──────────────────────────── */}
          <SectionShell
            id="the-data"
            bare
          >
            <ScrollScene name="patient-data" pin={false} beats={5} steps={6} index="006" title="The patient data Lina uses">
              {({ progress }) => <DataDimensions progress={progress} />}
            </ScrollScene>
          </SectionShell>

          {/* ── 07 Commercial ────────────────────────────────── */}
          <SectionShell
            id="commercial"
            bare
          >
            <ScrollScene name="commercial" pin={false} beats={1} index="007" title="What your pharmacy could earn">
              {() => <Commercial />}
            </ScrollScene>
          </SectionShell>

          {/* ── 08 Team ──────────────────────────────────────── */}
          <SectionShell id="team" bare>
            <ScrollScene name="team" beats={1} index="008" title="The team">
              {() => (
                <div data-scene-step={0}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PEOPLE.map((person) => (
                      <Person key={person.name} person={person} />
                    ))}
                  </div>
                </div>
              )}
            </ScrollScene>
          </SectionShell>

          {/* ── 09 CTA and recurring care ────────────────────── */}
          <section id="partner" className="scroll-mt-20 border-t px-5 py-12 sm:py-16 lg:py-20" style={{ borderColor: LINE }}>
            <div className="mx-auto max-w-[1180px]">
              <ScrollScene name="partner" pin={false} beats={2}>
                {() => (
                <div className="border" style={{ borderColor: LINE, background: CANVAS }}>
                  <div className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-12 lg:p-10">
                    <div>
                      <Chip tone="blue">Exclusive Pharmacy Show offer</Chip>
                      <p className="mt-5 max-w-[520px] text-[24px] font-normal leading-[1.2] tracking-[-.03em] sm:text-[30px]" style={{ color: INK }}>
                        Get an exclusive Pharmacy Show discount or partnership
                      </p>
                      <p className="mt-4 max-w-[460px] text-[13.5px] leading-[1.7]" style={{ color: BODY }}>
                        Email us to ask about the offer or a partnership built around your team.
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-2.5">
                        <Outline href={CONTACT}>Email us</Outline>
                        <Solid href={BOOK_A_DEMO}>Book a demo</Solid>
                      </div>

                      <p className="mt-4 text-[12.5px] leading-[1.6]" style={{ color: MUTED }}>
                        Tell us what you’re looking for and we’ll take it from there.
                      </p>

                      <ul className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                        {PARTNER_POINTS.map((point) => (
                          <li key={point} className="flex items-start gap-2.5">
                            <span className="mt-[5px] h-[6px] w-[6px] flex-none" style={{ background: BLUE }} />
                            <span className="text-[12.5px] leading-[1.5]" style={{ color: BODY }}>
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <CtaPreview />
                      <p className="mt-3 text-[11.5px] leading-[1.55]" style={{ color: MUTED }}>
                        No prices, no contracted terms and no promised retention figures. There is nothing to promise yet.
                      </p>
                    </div>
                  </div>
                  <div id="beyond" className="scroll-mt-20 border-t bg-white p-5 sm:p-8 lg:p-10" style={{ borderColor: LINE }}>
                    <ScrollScene name="recurring-care" pin={false} beats={1} title="What comes after GLP-1">
                      {() => <RecurringCare />}
                    </ScrollScene>
                  </div>
                </div>
                )}
              </ScrollScene>
            </div>
          </section>
        </main>

        <footer className="border-t px-5 py-10" style={{ borderColor: LINE }}>
          <div className="mx-auto flex max-w-[1180px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="Lina" width={56} height={21} className="h-[21px] w-[56px] flex-none" style={{ filter: 'brightness(0)' }} />
              <span className="text-[12.5px] leading-relaxed" style={{ color: FAINT }}>
                Infrastructure for continuous, personalised care
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Outline href={CONTACT} className="!px-3 !py-1.5 !text-[12.5px]">
                Contact
              </Outline>
              <Solid href={BOOK_A_DEMO} className="!px-3 !py-1.5 !text-[12.5px]">Book a demo</Solid>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-[1180px]">
            <p className="max-w-[760px] text-[11.5px] leading-[1.7]" style={{ color: FAINT }}>
              Every patient, measurement, message and chart on this page is illustrative. Lina prepares communications
              and surfaces what a care team should look at. It does not make clinical decisions, and it does not replace
              a pharmacist, prescriber or GP. Patient data would be handled under an agreement with the provider.
            </p>
          </div>
        </footer>

        {waitlistOpen ? <WaitlistModal onClose={closeWaitlist} /> : null}
      </div>
    </>
  );
}
