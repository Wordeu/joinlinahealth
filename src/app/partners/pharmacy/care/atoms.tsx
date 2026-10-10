'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  BLUE,
  BLUE_DEEP,
  BLUE_SOFT,
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
  TONES,
  useInView,
  useReducedMotion,
} from './ui';
import { CompositionChart, VideoLine, WeightChart, videoHead } from './charts';
import { APPROVAL_LABEL, LINDA_WEIGHT, PROVIDER, type Approval, type Moment, type SignalTone, type WeightPoint } from './data';

/* ── Record pieces ──────────────────────────────────────────────────── */

export function Field({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-l pl-2.5" style={{ borderColor: LINE }}>
      <Mono size={9}>{label}</Mono>
      <p className="mt-1.5 text-[13px] font-semibold leading-none tabular-nums" style={{ color: INK }}>
        {value}
      </p>
      {note ? (
        <p className="mt-1 text-[10.5px] leading-tight" style={{ color: MUTED }}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function SignalCard({
  tone,
  title,
  because,
  evidence,
  dim = false,
  compact = false,
}: {
  tone: SignalTone;
  title: string;
  because: string;
  evidence: string;
  dim?: boolean;
  compact?: boolean;
}) {
  const t = TONES[tone];
  return (
    <div
      className="border bg-white transition-all duration-300"
      style={{ borderColor: t.line, opacity: dim ? 0.42 : 1, borderLeftWidth: 3, borderLeftColor: t.fg }}
    >
      <div className={compact ? 'p-2.5' : 'p-3'}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <Mono size={9} colour={t.fg}>
            Signal
          </Mono>
          <Mono size={9} colour={FAINT}>
            {evidence}
          </Mono>
        </div>
        <p className="mt-2 text-[13px] font-semibold leading-[1.35] tracking-[-.01em]" style={{ color: INK }}>
          {title}
        </p>
        <p className="mt-1 text-[11.5px] leading-[1.45]" style={{ color: BODY }}>
          {because}
        </p>
      </div>
    </div>
  );
}

export function ActionCard({
  title,
  detail,
  approval,
  state = 'proposed',
  onAct,
  compact = false,
}: {
  title: string;
  detail: string;
  approval: Approval;
  state?: 'proposed' | 'done';
  onAct?: () => void;
  compact?: boolean;
}) {
  const a = APPROVAL_LABEL[approval];
  return (
    <div className="border bg-white" style={{ borderColor: LINE }}>
      <div className={compact ? 'p-2.5' : 'p-3'}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <Mono size={9} colour={BLUE}>
            Next action
          </Mono>
          <Chip tone={a.tone}>{a.text}</Chip>
        </div>
        <p className="mt-2 text-[13px] font-semibold leading-[1.35] tracking-[-.01em]" style={{ color: INK }}>
          {title}
        </p>
        <p className="mt-1 text-[11.5px] leading-[1.45]" style={{ color: BODY }}>
          {detail}
        </p>
        {onAct ? (
          <button
            type="button"
            onClick={onAct}
            disabled={state === 'done'}
            className="mt-2.5 inline-flex min-h-11 items-center gap-1.5 border px-2.5 py-[5px] text-[11px] font-medium transition-colors disabled:cursor-default"
            style={
              state === 'done'
                ? { borderColor: TONES.green.line, background: TONES.green.bg, color: TONES.green.fg }
                : { borderColor: BLUE, background: BLUE, color: '#fff' }
            }
          >
            {state === 'done' ? '✓ Done' : approval === 'clinician' ? 'Send to clinician' : approval === 'review' ? 'Send for review' : 'Approve and send'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ── Messaging ──────────────────────────────────────────────────────── */

function Ticks({ state }: { state?: 'delivered' | 'read' | 'sent' }) {
  if (!state) return null;
  const colour = state === 'read' ? BLUE : MUTED;
  return (
    <span className="ml-1.5 inline-flex items-center gap-[1px] align-middle" aria-label={state}>
      <svg viewBox="0 0 16 12" className="h-2.5 w-2.5" fill="none" stroke={colour} strokeWidth="2" strokeLinecap="round">
        <path d="M1 6.5 4.5 10 11 2" />
      </svg>
      {state !== 'sent' ? (
        <svg viewBox="0 0 16 12" className="-ml-[5px] h-2.5 w-2.5" fill="none" stroke={colour} strokeWidth="2" strokeLinecap="round">
          <path d="M1 6.5 4.5 10 11 2" />
        </svg>
      ) : null}
    </span>
  );
}

export function Thread({
  messages,
  visible,
  thumbnail,
  /** The moment this thread belongs to, so an attached video stops on the
   *  weigh-in the patient had actually reached when it was sent. */
  week = 16,
  scenes,
  className = '',
  attachmentClassName = '',
  compactAttachment = false,
}: {
  messages: Moment['thread'];
  visible?: number;
  thumbnail?: React.ReactNode;
  week?: number;
  scenes?: string[];
  className?: string;
  attachmentClassName?: string;
  compactAttachment?: boolean;
}) {
  const shown = visible ?? messages.length;
  return (
    <div className={`flex flex-col border bg-white ${className}`} style={{ borderColor: LINE }}>
      <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
        <span className="grid h-6 w-6 flex-none place-items-center text-[9px] font-bold text-white" style={{ background: BLUE_DEEP, fontFamily: MONO }}>
          BS
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11.5px] font-semibold leading-none" style={{ color: INK }}>
            {PROVIDER}
          </p>
          <Mono size={8} colour={FAINT} className="mt-1">
            Patient messaging · business account
          </Mono>
        </div>
      </div>

      <div className="flex-1 space-y-2 p-3" style={{ background: '#FBFCFD' }}>
        {messages.map((m, i) => {
          const on = i < shown;
          const mine = m.from === 'patient';
          return (
            <div
              key={i}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              style={{
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(6px)',
                transition: 'opacity .3s ease-out, transform .3s ease-out',
              }}
            >
              <div
                className="max-w-[88%] border px-2.5 py-2"
                style={{
                  background: mine ? BLUE_WASH : PAPER,
                  borderColor: mine ? BLUE_SOFT : LINE,
                }}
              >
                <div className={m.attachment && compactAttachment ? 'grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] items-center gap-3' : undefined}>
                  {m.attachment ? (
                    <div className={`${compactAttachment ? '' : 'mb-2 '}border ${attachmentClassName}`} style={{ borderColor: LINE_SOFT }}>
                      {thumbnail ?? <VideoThumb label={m.attachment} upToWeek={week} scenes={scenes} />}
                    </div>
                  ) : null}
                  <p className="text-[11.5px] leading-[1.5]" style={{ color: INK }}>
                    {m.body}
                  </p>
                </div>
                <span className="mt-1 flex items-center justify-end">
                  <span className="text-[9px]" style={{ color: FAINT, fontFamily: MONO }}>
                    {mine ? 'Linda' : 'Lina'}
                  </span>
                  {!mine ? <Ticks state={m.state} /> : null}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── The personalised video, as a preview ───────────────────────────── */

const VIDEO_EASE = 'cubic-bezier(.22,.61,.36,1)';
/** A forty-second film is not worth forty seconds of a landing page, so the
 *  playhead covers the whole thing in a few, and the timecode tells the truth
 *  about how long the patient's version runs. */
const PLAY_MS = 3400;
/** A beat on the poster frame before it starts, so the frame is seen to arrive
 *  and then to play, rather than doing both at once. */
const PLAY_LEAD_MS = 520;

const DEFAULT_SCENES = ['Your progress', 'Your journey', 'Beyond the scales', 'What this means', 'Your next step'];

/** Splits "Your 4-month review · 40s" into the title and its running time. */
function readLabel(label: string) {
  const parts = label.split('·').map((s) => s.trim());
  const seconds = Number((parts[1] ?? '').replace(/\D/g, '')) || 40;
  return { title: parts[0] || label, seconds };
}

const timecode = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Runs the playhead once, from the moment `play` turns true. */
function usePlayhead(play: boolean, ms: number, lead: number) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!play) {
      setT(0);
      return;
    }
    if (reduced) {
      setT(1);
      return;
    }
    setT(0);
    const start = performance.now() + lead;
    const tick = (now: number) => {
      const next = Math.max(0, Math.min(1, (now - start) / ms));
      setT(next);
      if (next < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [play, ms, lead, reduced]);

  return t;
}

/** The chrome every personalised video on this page wears: a sixteen-by-nine
 *  frame, the film's name, the chapter it has reached and where the playhead
 *  is. The picture itself is whatever the caller puts inside. One frame for
 *  the thumbnail in a message and for the film the patient actually watches,
 *  so the two are recognisably the same object at different sizes. */
function VideoFrame({
  title,
  chapters,
  t,
  seconds,
  onToggle,
  spaciousCaption = false,
  children,
}: {
  title: string;
  chapters: string[];
  /** The playhead, 0 to 1. */
  t: number;
  /** How long the patient's copy really runs, for the timecode. */
  seconds: number;
  onToggle?: () => void;
  spaciousCaption?: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const ease = reduced ? 'none' : VIDEO_EASE;
  // The play mark belongs on a poster frame. Once it has run, leave the picture.
  const poster = t === 0;
  const current = Math.min(chapters.length - 1, Math.floor(t * chapters.length));
  const Stage = onToggle ? 'button' : 'div';

  return (
    <Stage
      {...(onToggle
        ? { type: 'button' as const, onClick: onToggle, 'aria-label': `${poster ? 'Play' : 'Pause'} ${title}` }
        : {})}
      className="relative block w-full overflow-hidden text-left"
      style={{
        aspectRatio: spaciousCaption ? undefined : '16 / 9',
        // Add room below the picture without reducing the chart's height.
        paddingTop: spaciousCaption ? 'calc(56.25% + 20px)' : undefined,
        background: 'linear-gradient(168deg, #F5F8FF 0%, #FFFFFF 58%)',
      }}
    >
      {/* The picture sits between the two bands. */}
      <span className="absolute inset-x-0 block" style={{ top: 22, bottom: spaciousCaption ? 47 : 27 }}>
        {children}
      </span>

      {/* Title band. What the film is, and that it was built for her. */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 flex h-[22px] items-center gap-2 border-b px-2.5"
        style={{ borderColor: LINE_SOFT, background: 'rgba(255,255,255,.88)' }}
      >
        <span className="min-w-0 flex-1 truncate text-[9.5px] leading-none" style={{ color: BODY, fontFamily: MONO, letterSpacing: '.04em' }}>
          {title}
        </span>
        <span className="flex flex-none items-center gap-1.5">
          <span className="block h-[4px] w-[4px]" style={{ background: BLUE }} />
          <span className="text-[8px] leading-none" style={{ color: FAINT, fontFamily: MONO, letterSpacing: '.1em' }}>
            Personalised
          </span>
        </span>
      </span>

      {/* Square, like everything else here, but unmistakably a play control. */}
      <span
        className="pointer-events-none absolute inset-0 grid place-items-center"
        style={{
          opacity: poster ? 1 : 0,
          bottom: spaciousCaption ? 20 : undefined,
          transform: poster ? 'scale(1)' : 'scale(1.12)',
          transition: reduced ? 'none' : `opacity .5s ${ease}, transform .5s ${ease}`,
        }}
      >
        <span
          className="grid h-8 w-8 place-items-center border"
          style={{ borderColor: LINE, background: 'rgba(255,255,255,.96)', boxShadow: '0 1px 10px rgba(12,17,22,.12)' }}
        >
          <svg viewBox="0 0 12 12" className="h-[11px] w-[11px] translate-x-[1px]" fill={BLUE} aria-hidden="true">
            <path d="M2 .8 10.6 6 2 11.2Z" />
          </svg>
        </span>
      </span>

      {/* Lower third, with the transport on the bottom edge of the frame rather
          than under it. Fixed height, so a longer chapter title crossfades in
          place instead of moving anything. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 block">
        <span
          className={`flex items-center gap-2 border-t px-2.5 ${spaciousCaption ? 'h-11' : 'h-6'}`}
          style={{ borderColor: LINE_SOFT, background: 'rgba(255,255,255,.94)' }}
        >
          {/* The chapters roll through the band the way a lower third does:
              the old one leaves upwards as the new one arrives from below, so
              they never sit on top of each other and the band is never empty. */}
          <span className={`relative block min-w-0 flex-1 overflow-hidden ${spaciousCaption ? 'h-4' : 'h-3'}`}>
            {chapters.map((caption, i) => (
              <span
                key={caption}
                className={`absolute inset-0 truncate text-[10.5px] font-semibold ${spaciousCaption ? 'leading-4' : 'leading-3'}`}
                style={{
                  color: INK,
                  opacity: i === current ? 1 : 0,
                  transform: i === current ? 'none' : `translateY(${i < current ? '-100%' : '100%'})`,
                  transition: reduced ? 'none' : `opacity .38s ${ease}, transform .38s ${ease}`,
                }}
              >
                {caption}
              </span>
            ))}
          </span>
          <span className="flex-none text-[8.5px] leading-none tabular-nums" style={{ color: MUTED, fontFamily: MONO, letterSpacing: '.04em' }}>
            {timecode(t * seconds)} / {timecode(seconds)}
          </span>
        </span>
        <span className="relative block h-[3px]" style={{ background: LINE }}>
          <span className="absolute inset-y-0 left-0" style={{ width: `${t * 100}%`, background: BLUE }} />
          <span
            className="absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${t * 100}%`, background: BLUE_DEEP }}
          />
        </span>
      </span>
    </Stage>
  );
}

/** A still of the film Lina builds for one patient: her own line, her own
 *  numbers, her own chapters. `play` runs it through once; left alone it sits
 *  on a poster frame with the whole line drawn. */
export function VideoThumb({
  label,
  points = LINDA_WEIGHT,
  upToWeek = 16,
  scenes = DEFAULT_SCENES,
  play = false,
  spaciousCaption = false,
}: {
  label: string;
  points?: WeightPoint[];
  upToWeek?: number;
  scenes?: string[];
  play?: boolean;
  spaciousCaption?: boolean;
}) {
  const t = usePlayhead(play, PLAY_MS, PLAY_LEAD_MS);
  const { title, seconds } = readLabel(label);
  // Idle, the poster shows the finished line. Playing, it draws with the head.
  const reveal = play ? t : 1;
  const head = videoHead(reveal, points, upToWeek);

  return (
    <figure className="m-0" style={{ background: PAPER }}>
      <VideoFrame title={title} chapters={scenes} t={t} seconds={seconds} spaciousCaption={spaciousCaption}>
        <span className="absolute" style={{ inset: '-22px 0 -27px' }}>
          <VideoLine reveal={reveal} points={points} domainWeeks={upToWeek} />
          {/* Her number travels with the playhead. */}
          <span
            className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap pb-[7px] text-[10px] font-semibold leading-none tabular-nums"
            style={{ left: head.left, top: head.top, color: BLUE_DEEP, fontFamily: MONO, letterSpacing: '.01em' }}
          >
            {head.kg.toFixed(1)} kg
          </span>
        </span>
      </VideoFrame>
    </figure>
  );
}

/* ── The film itself ────────────────────────────────────────────────── */

/** Forty seconds of film is not worth forty seconds of a landing page. Each
 *  chapter gets long enough to read, and the timecode tells the truth about
 *  how long the patient's copy runs. */
const FILM_CHAPTER_MS = 1900;

/** The whole film, at the size the patient watches it. Same frame as the
 *  thumbnail; the picture inside changes chapter by chapter. */
export function VideoPlayer({ moment, autoPlay = true }: { moment: Moment; autoPlay?: boolean }) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.25, false);
  const chapters = moment.video?.scenes ?? [];
  const runtime = chapters.length * FILM_CHAPTER_MS;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const position = useRef(0);
  const raf = useRef(0);

  position.current = t;
  const shouldAutoPlay = autoPlay && inView && !reduced;

  // A new month means a different film. Start it over rather than carry on.
  useEffect(() => {
    setT(0);
    setPlaying(shouldAutoPlay && chapters.length > 0);
  }, [moment.id, shouldAutoPlay, chapters.length]);

  useEffect(() => {
    if (!playing) return;
    const from = position.current >= 1 ? 0 : position.current;
    const start = performance.now();
    const tick = (now: number) => {
      const next = Math.min(1, from + (now - start) / runtime);
      setT(next);
      if (next < 1) raf.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, runtime]);

  const toggle = useCallback(() => {
    if (position.current >= 1) {
      setT(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  }, []);

  // Week 2 has no film. The panel keeps its shape and says why.
  if (!moment.video) {
    return (
      <div ref={ref} className="relative w-full border" style={{ aspectRatio: '16 / 9', borderColor: LINE, background: CANVAS }}>
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <Mono size={9} colour={FAINT}>
              No film this month
            </Mono>
            <p className="mx-auto mt-2.5 max-w-[300px] text-[12px] leading-[1.55]" style={{ color: BODY }}>
              Week 2 is a conversation, not a film. Lina sends guidance and puts the thread in front of a pharmacist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const current = Math.min(chapters.length - 1, Math.floor(t * chapters.length));

  return (
    <div ref={ref} className="border" style={{ borderColor: LINE, background: PAPER }}>
      <VideoFrame title={moment.video.title} chapters={chapters} t={t} seconds={40} onToggle={toggle}>
        {chapters.map((chapter, i) => (
          <span
            key={chapter}
            className="absolute inset-0 block px-4 py-3"
            style={{
              // One picture dissolves into the next. They are different shapes,
              // so an overlap reads as a cut rather than as two things at once.
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'none' : 'scale(.985)',
              transition: reduced ? 'none' : `opacity .42s ${VIDEO_EASE}, transform .42s ${VIDEO_EASE}`,
            }}
            aria-hidden={i !== current}
          >
            <FilmChapter moment={moment} index={i} />
          </span>
        ))}
      </VideoFrame>
    </div>
  );
}

/** One chapter of the film. Each fills the frame it is given, so the picture
 *  changes without the frame ever resizing. */
function FilmChapter({ moment, index }: { moment: Moment; index: number }) {
  const comp = moment.composition;
  const delta = Number((moment.weightKg - LINDA_WEIGHT[0].kg).toFixed(1));

  if (index === 0) {
    return (
      <span className="flex h-full flex-col justify-center">
        <Mono size={9}>Weight change</Mono>
        <span className="mt-2 block text-[38px] font-bold leading-none tabular-nums tracking-[-.04em]" style={{ color: INK }}>
          {delta.toFixed(1)}
          <span className="text-[17px] font-semibold"> kg</span>
        </span>
        <span className="mt-2.5 block text-[12.5px] font-medium" style={{ color: BLUE }}>
          {LINDA_WEIGHT[0].kg} kg at the start · {moment.weightKg.toFixed(1)} kg today
        </span>
      </span>
    );
  }

  if (index === 1) {
    return (
      <span className="flex h-full flex-col">
        <span className="min-h-0 flex-1">
          <WeightChart upToWeek={moment.week} domainWeeks={moment.week} highlightWeek={moment.week} className="h-full" />
        </span>
        <span className="mt-1 block text-[10.5px] leading-tight" style={{ color: MUTED }}>
          Every square is a weigh-in, at the pharmacy or sent in by you.
        </span>
      </span>
    );
  }

  if (index === 2 && comp) {
    return (
      <span className="flex h-full flex-col">
        <span className="min-h-0 flex-1">
          <CompositionChart split week={moment.week} className="h-full" />
        </span>
      </span>
    );
  }

  if (index === 2) {
    return (
      <span className="flex h-full flex-col justify-center gap-1.5">
        {moment.measurements.slice(0, 3).map((m) => (
          <span key={m.label} className="flex items-baseline justify-between border-b pb-1.5" style={{ borderColor: LINE_SOFT }}>
            <span className="text-[11.5px]" style={{ color: BODY }}>
              {m.label}
            </span>
            <span className="text-[13px] font-semibold tabular-nums" style={{ color: INK }}>
              {m.value}
            </span>
          </span>
        ))}
      </span>
    );
  }

  if (index === 3) {
    return comp ? (
      <span className="flex h-full flex-col justify-center">
        <span className="flex border" style={{ borderColor: LINE_SOFT }}>
          <span className="flex-1 p-2.5">
            <Mono size={9}>Fat mass</Mono>
            <span className="mt-1.5 block text-[20px] font-bold leading-none tabular-nums" style={{ color: BLUE }}>
              {comp.fatDelta.toFixed(1)} kg
            </span>
          </span>
          <span className="flex-1 border-l p-2.5" style={{ borderColor: LINE_SOFT }}>
            <Mono size={9}>Lean mass</Mono>
            <span className="mt-1.5 block text-[20px] font-bold leading-none tabular-nums" style={{ color: BLUE_DEEP }}>
              {comp.leanDelta.toFixed(1)} kg
            </span>
          </span>
        </span>
        <span className="mt-2.5 block text-[12px] leading-[1.5]" style={{ color: BODY }}>
          Most of what you lost was fat. Some lean tissue came down too, and that is the part worth protecting from here.
        </span>
      </span>
    ) : (
      <span className="flex h-full flex-col justify-center">
        <span className="block text-[13px] leading-[1.55]" style={{ color: INK }}>
          {moment.signal.because}
        </span>
        <span className="mt-2 block text-[12px] leading-[1.5]" style={{ color: MUTED }}>
          This is your measurement, not an average.
        </span>
      </span>
    );
  }

  return (
    <span className="flex h-full flex-col justify-center">
      <span className="block text-[13px] leading-[1.55]" style={{ color: INK }}>
        {moment.next}
      </span>
      <span className="mt-3 flex items-center gap-2">
        <span className="grid h-5 w-5 flex-none place-items-center text-[8px] font-bold text-white" style={{ background: BLUE_DEEP, fontFamily: MONO }}>
          BS
        </span>
        <Mono size={9} colour={BODY}>
          Reply and {PROVIDER} will book you in
        </Mono>
      </span>
    </span>
  );
}

/* ── Provider row ───────────────────────────────────────────────────── */

export function PatientRow({
  initials,
  name,
  treatment,
  stage,
  lastActivity,
  status,
  tone,
  selected = false,
  dim = false,
  onSelect,
}: {
  initials: string;
  name: string;
  treatment: string;
  stage: string;
  lastActivity: string;
  status: string;
  tone?: SignalTone;
  selected?: boolean;
  dim?: boolean;
  onSelect?: () => void;
}) {
  const Tag = onSelect ? 'button' : 'div';
  return (
    <Tag
      {...(onSelect ? { type: 'button' as const, onClick: onSelect, 'aria-pressed': selected } : {})}
      className="grid w-full grid-cols-[auto_minmax(0,1.5fr)_minmax(0,1fr)_auto] items-center gap-2.5 border-b px-2.5 py-2 text-left transition-colors duration-200 sm:gap-3 sm:px-3"
      style={{
        borderColor: LINE_SOFT,
        background: selected ? BLUE_WASH : 'transparent',
        opacity: dim ? 0.45 : 1,
        boxShadow: selected ? `inset 2px 0 0 ${BLUE}` : 'none',
      }}
    >
      <Avatar initials={initials} active={selected} size={24} />
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-semibold leading-tight" style={{ color: INK }}>
          {name}
        </span>
        <span className="mt-[3px] block truncate text-[10.5px] leading-tight" style={{ color: MUTED }}>
          {treatment} · {stage}
        </span>
      </span>
      <span className="hidden truncate text-[10.5px] sm:block" style={{ color: FAINT, fontFamily: MONO, letterSpacing: '.03em' }}>
        {lastActivity}
      </span>
      <span className="justify-self-end">
        {tone ? <Chip tone={tone}>{status}</Chip> : <Chip tone="grey" dot={false}>{status}</Chip>}
      </span>
    </Tag>
  );
}
