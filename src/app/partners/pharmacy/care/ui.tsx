'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Tokens ─────────────────────────────────────────────────────────────
   Clinical blue, hairline rules, square corners. Everything here is a flat
   value so the demos can share one palette rather than inventing their own. */

export const INK = '#0C1116';
export const BODY = '#55606B';
export const MUTED = '#8B949E';
export const FAINT = '#A8B0B8';
export const LINE = '#E2E6EA';
export const LINE_SOFT = '#EDEFF2';
export const CANVAS = '#F7F8FA';
export const PAPER = '#FFFFFF';

export const BLUE = '#2563EB';
export const BLUE_DEEP = '#1B46C2';
export const BLUE_MID = '#6E96F4';
export const BLUE_SOFT = '#D7E3FD';
export const BLUE_WASH = '#F1F5FE';

export const GREEN = '#0E9A62';
export const GREEN_WASH = '#ECF8F2';
export const AMBER = '#B5750C';
export const AMBER_WASH = '#FDF5E7';
export const RED = '#BA3A2E';
export const RED_WASH = '#FCEFED';

export const MONO = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const TONES = {
  blue: { fg: BLUE, bg: BLUE_WASH, line: BLUE_SOFT },
  green: { fg: GREEN, bg: GREEN_WASH, line: '#CCEBDD' },
  amber: { fg: AMBER, bg: AMBER_WASH, line: '#F2E3C4' },
  red: { fg: RED, bg: RED_WASH, line: '#F3D5D1' },
  grey: { fg: BODY, bg: '#F4F5F7', line: LINE },
} as const;

export type Tone = keyof typeof TONES;

/* ── Hooks ──────────────────────────────────────────────────────────── */

export function useInView<T extends HTMLElement>(threshold = 0.08, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries[0].isIntersecting;
        setInView(hit);
        if (hit && once) observer.disconnect();
      },
      { threshold, rootMargin: '0px 0px -4% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/** Interpolates towards `target` whenever it changes. Jumps straight there
 *  under reduced motion so the number is always readable. */
export function useTween(target: number, duration = 650, decimals = 1) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = origin + (target - origin) * eased;
      setValue(next);
      from.current = next;
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, reduced]);

  return Number(value.toFixed(decimals));
}

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.05);
  const reduced = useReducedMotion();
  return (
    <div
      ref={ref}
      className={className}
      data-in-view={inView ? 'true' : 'false'}
      style={{
        opacity: reduced || inView ? 1 : 0,
        transform: reduced || inView ? 'none' : 'translateY(14px)',
        transition: reduced
          ? 'none'
          : `opacity .65s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .65s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Primitives ─────────────────────────────────────────────────────── */

/** A square-cornered, hairline-bordered panel. The base shape of the page. */
export function Rect({
  children,
  className = '',
  style,
  tone = 'line',
  as: Tag = 'div',
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tone?: 'line' | 'soft' | 'blue';
  as?: 'div' | 'article' | 'section' | 'li';
}) {
  const border = tone === 'blue' ? BLUE_SOFT : tone === 'soft' ? LINE_SOFT : LINE;
  return (
    <Tag className={`border bg-white ${className}`} style={{ borderColor: border, borderRadius: 0, ...style }}>
      {children}
    </Tag>
  );
}

/** Small system UI label. Used for every field name on the page. */
export function Mono({
  children,
  className = '',
  colour = MUTED,
  size = 10,
}: {
  children: React.ReactNode;
  className?: string;
  colour?: string;
  size?: number;
}) {
  return (
    <span
      className={`block leading-[1.4] ${className}`}
      style={{ fontFamily: MONO, fontSize: size, letterSpacing: 0, color: colour }}
    >
      {children}
    </span>
  );
}

/** Headline number with a monospace caption above and an optional blue note. */
export function Stat({
  label,
  value,
  suffix,
  note,
  noteTone = BLUE,
  size = 40,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  note?: React.ReactNode;
  noteTone?: string;
  size?: number;
}) {
  return (
    <div>
      <Mono>{label}</Mono>
      <p
        className="mt-2.5 font-bold leading-none tracking-[-.03em] tabular-nums"
        style={{ color: INK, fontSize: size }}
      >
        {value}
        {suffix ? (
          <span className="font-semibold" style={{ fontSize: size * 0.46 }}>
            {suffix}
          </span>
        ) : null}
      </p>
      {note ? (
        <p className="mt-2 text-[13px] font-medium leading-none" style={{ color: noteTone }}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** Corner crop marks around an illustration area. */
export function Frame({ children, className = '', inset = 10 }: { children: React.ReactNode; className?: string; inset?: number }) {
  const corner = (pos: React.CSSProperties, path: string) => (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="pointer-events-none absolute h-3 w-3"
      style={pos}
      fill="none"
      stroke={LINE}
      strokeWidth="1"
    >
      <path d={path} />
    </svg>
  );
  return (
    <div className={`relative ${className}`} style={{ padding: inset }}>
      {corner({ top: 0, left: 0 }, 'M0 12V0h12')}
      {corner({ top: 0, right: 0 }, 'M0 0h12v12')}
      {corner({ bottom: 0, left: 0 }, 'M0 0v12h12')}
      {corner({ bottom: 0, right: 0 }, 'M12 0v12H0')}
      {children}
    </div>
  );
}

/** Square segmented control. */
export function Seg<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  activeValueTone,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  label: string;
  size?: 'sm' | 'md';
  activeValueTone?: (value: T) => 'blue' | 'neutral';
}) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-[12.5px]';
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex border p-[3px]" style={{ borderColor: LINE, background: CANVAS }}>
      {options.map((option) => {
        const on = option.value === value;
        const activeTone = on ? (activeValueTone?.(option.value) ?? 'neutral') : 'neutral';
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option.value)}
            className={`min-h-11 font-medium transition-colors duration-150 ${pad}`}
            style={{
              background: on ? (activeTone === 'blue' ? BLUE : PAPER) : 'transparent',
              color: on ? (activeTone === 'blue' ? PAPER : INK) : MUTED,
              border: `1px solid ${on ? (activeTone === 'blue' ? BLUE : LINE) : 'transparent'}`,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Status chip. Carries a word as well as a colour, never colour alone. */
export function Chip({ tone = 'grey', children, dot = true }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-[3px] text-[10.5px] font-medium leading-none"
      style={{ background: t.bg, color: t.fg, borderColor: t.line }}
    >
      {dot ? <span className="h-[5px] w-[5px] flex-none" style={{ background: t.fg }} /> : null}
      {children}
    </span>
  );
}

/** Patient initials in a square. Identical wherever a patient appears. */
export function Avatar({ initials, size = 26, active = false }: { initials: string; size?: number; active?: boolean }) {
  return (
    <span
      className="grid flex-none place-items-center border font-semibold transition-colors duration-200"
      style={{
        height: size,
        width: size,
        fontSize: size * 0.4,
        background: active ? BLUE : CANVAS,
        color: active ? '#fff' : BODY,
        borderColor: active ? BLUE : LINE,
      }}
    >
      {initials}
    </span>
  );
}

/** Dot-matrix block, borrowed from the reference style. Density carries meaning. */
export function PixelBars({
  values,
  columns = 34,
  rows = 7,
  colour = BLUE,
  className = '',
}: {
  values: number[];
  columns?: number;
  rows?: number;
  colour?: string;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-[2px] ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: rows * columns }, (_, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const height = Math.round((values[col % values.length] ?? 0) * rows);
        const filled = rows - row <= height;
        const top = rows - row === height;
        return (
          <span
            key={i}
            className="aspect-square"
            style={{ background: filled ? (top ? BLUE_MID : colour) : '#ECEEF1' }}
          />
        );
      })}
    </div>
  );
}

/* ── Section furniture ──────────────────────────────────────────────── */

/** A numbered section. The title is a label for what the section is, not a
 *  headline, so it sits on one line next to its number. */
export function SectionShell({
  id,
  index,
  title,
  children,
  bare = false,
}: {
  id?: string;
  index?: string;
  title?: string;
  children: React.ReactNode;
  bare?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t px-5 py-12 sm:py-16 lg:py-20" style={{ borderColor: LINE }}>
      <div className="mx-auto max-w-[1180px]">
        {bare ? null : (
          <Reveal>
            <div className="flex flex-col items-start gap-2">
              {index ? <Mono colour={BLUE}>{index}</Mono> : null}
              {title ? (
                <h2
                  className="max-w-[780px] text-[22px] font-normal leading-[1.23] tracking-[-.025em] sm:text-[30px]"
                  style={{ color: INK }}
                >
                  {title}
                </h2>
              ) : null}
            </div>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/** Grey plotting surface the demos sit on. Square, hairline, faint grid. */
export function Canvas({
  children,
  className = '',
  minHeight,
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden border ${className}`}
      style={{
        borderColor: LINE,
        minHeight,
        backgroundColor: CANVAS,
        backgroundImage: `linear-gradient(${LINE_SOFT} 1px, transparent 1px), linear-gradient(90deg, ${LINE_SOFT} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        backgroundPosition: '-1px -1px',
      }}
    >
      {children}
    </div>
  );
}

/** Text button used for replay / explore affordances. */
export function GhostButton({
  onClick,
  children,
  active = false,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 items-center gap-1.5 border px-3 py-[5px] text-[11.5px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-[34px]"
      style={{
        borderColor: active ? BLUE : LINE,
        color: active ? BLUE : BODY,
        background: active ? BLUE_WASH : PAPER,
      }}
    >
      {children}
    </button>
  );
}
