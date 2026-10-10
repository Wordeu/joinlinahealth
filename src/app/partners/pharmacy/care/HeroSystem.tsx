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
  GhostButton,
  INK,
  LINE,
  LINE_SOFT,
  MONO,
  MUTED,
  Mono,
  PAPER,
  useInView,
  useReducedMotion,
} from './ui';
import { WeightChart } from './charts';
import { SignalCard, VideoThumb } from './atoms';
import { PATIENTS, PROVIDER, QUIET_PATIENTS, type Patient } from './data';
import ScrollScene, { sceneProgress } from './ScrollScene';

/* Scene boundaries in milliseconds. Step 0 is the empty interface, step 7 the
   finished loop. The same sequence runs every time, so replay is deterministic. */
const SCENE_AT = [0, 300, 1600, 3200, 4800, 6600, 8600, 10200];

/** Which of the five loop stages each scene belongs to. */
const LOOP = ['Read', 'Detect', 'Decide', 'Deliver', 'Learn'];
const LOOP_AT = [0, 0, 0, 1, 2, 3, 4, 4];

const EASE = 'cubic-bezier(.22,.61,.36,1)';

const LIST = [PATIENTS[0], PATIENTS[3], PATIENTS[1], PATIENTS[2]];

export default function HeroSystem() {
  return <ScrollScene name="hero" beats={7}>{({ progress }) => <HeroSequence progress={progress} />}</ScrollScene>;
}

function HeroSequence({ progress }: { progress: number | null }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.08);
  const reduced = useReducedMotion();
  const [timedStep, setStep] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const replayPosition = useRef<number | null>(null);
  const [manual, setManual] = useState<Patient | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const played = useRef(false);
  const step = reduced ? 7 : progress !== null && !replaying && !manual
    ? Math.min(7, Math.floor(sceneProgress(progress) * 8))
    : timedStep;

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const run = useCallback(() => {
    clear();
    replayPosition.current = progress;
    setReplaying(true);
    setManual(null);
    setStep(0);
    SCENE_AT.forEach((at, i) => {
      if (i === 0) return;
      timers.current.push(setTimeout(() => setStep(i), at));
    });
  }, [clear, progress]);

  useEffect(() => {
    if (progress !== null && replayPosition.current === null) {
      clear();
      setReplaying(false);
    }
    if (progress !== null && replayPosition.current !== null && Math.abs(progress - replayPosition.current) > 0.01) {
      clear();
      setReplaying(false);
      setManual(null);
      replayPosition.current = null;
    }
  }, [progress, clear]);

  useEffect(() => {
    if (progress !== null || !inView || played.current) return;
    played.current = true;
    if (reduced) {
      setStep(SCENE_AT.length - 1);
      return;
    }
    run();
  }, [inView, reduced, run, progress]);

  useEffect(() => clear, [clear]);

  // A click is a decision. Stop the film rather than talking over the viewer.
  const pick = useCallback(
    (patient: Patient) => {
      clear();
      replayPosition.current = progress;
      setManual(patient);
      setStep(SCENE_AT.length - 1);
    },
    [clear, progress]
  );

  const active = manual ?? PATIENTS[0];
  const isLinda = active.id === 'linda';
  const done = step >= 7;

  return (
    <div ref={ref} data-scene-step={step}>
      <div className="border bg-white" style={{ borderColor: LINE }}>
        {/* Window chrome */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
          style={{ borderColor: LINE_SOFT, background: CANVAS }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-5 w-5 place-items-center text-[8px] font-bold text-white"
              style={{ background: BLUE_DEEP, fontFamily: MONO }}
            >
              BS
            </span>
            <Mono size={9} colour={BODY}>
              {PROVIDER}
            </Mono>
          </div>
          <GhostButton onClick={run}>
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.9-4.1M13.5 1.5V4h-2.5" />
            </svg>
            Replay
          </GhostButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,272px)_minmax(0,1fr)_minmax(0,308px)]">
          {/* ── Left: the list ─────────────────────────────────── */}
          <div className="border-b lg:border-b-0 lg:border-r" style={{ borderColor: LINE_SOFT }}>
            <div className="flex items-center justify-between px-5 py-4">
              <Mono size={9}>Patients on treatment</Mono>
              <Mono size={9} colour={FAINT}>
                {LIST.length + QUIET_PATIENTS.length}
              </Mono>
            </div>
            <ul>
              {LIST.map((p, i) => {
                const on = step >= 1;
                const selected = active.id === p.id;
                const faded = step >= 2 && step < 7 && !selected && !manual;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => pick(p)}
                      aria-pressed={selected}
                      className="flex w-full items-center gap-3 border-t px-5 py-4 text-left"
                      style={{
                        borderColor: LINE_SOFT,
                        background: selected && step >= 2 ? BLUE_WASH : 'transparent',
                        boxShadow: selected && step >= 2 ? `inset 2px 0 0 ${BLUE}` : 'none',
                        opacity: on ? (faded ? 0.35 : 1) : 0,
                        transform: on ? 'none' : 'translateY(5px)',
                        transition: reduced
                          ? 'none'
                          : `opacity .5s ${EASE} ${on && step === 1 ? i * 110 : 0}ms, transform .5s ${EASE} ${
                              on && step === 1 ? i * 110 : 0
                            }ms, background .4s ${EASE}, box-shadow .4s ${EASE}`,
                      }}
                    >
                      <Avatar initials={p.initials} active={selected && step >= 2} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold leading-tight" style={{ color: INK }}>
                          {p.name.split(' ')[0]}, {p.age}
                        </span>
                        {/* Stage only. The treatment is one glance away in the record. */}
                        <span className="mt-1.5 block truncate text-[10px] leading-tight" style={{ color: MUTED, fontFamily: MONO, letterSpacing: '.06em' }}>
                          {p.stage}
                        </span>
                      </span>
                      {selected && step >= 7 ? <Chip tone="green">Viewed</Chip> : null}
                    </button>
                  </li>
                );
              })}
              <li className="border-t px-5 py-4" style={{ borderColor: LINE_SOFT }}>
                <Mono size={9} colour={FAINT}>
                  + {QUIET_PATIENTS.length} with nothing outstanding
                </Mono>
              </li>
            </ul>
          </div>

          {/* ── Centre: the record ─────────────────────────────── */}
          <div className="border-b p-5 lg:border-b-0 lg:border-r lg:p-6" style={{ borderColor: LINE_SOFT }}>
            <div
              style={{
                opacity: step >= 2 ? 1 : 0.3,
                transition: reduced ? 'none' : `opacity .6s ${EASE}`,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={active.initials} size={34} active />
                  <div>
                    <p className="text-[15px] font-semibold leading-none tracking-[-.015em]" style={{ color: INK }}>
                      {active.name.split(' ')[0]}, {active.age}
                    </p>
                    <Mono size={9} colour={MUTED} className="mt-2">
                      {active.stage} · {active.treatment}
                    </Mono>
                  </div>
                </div>
                <Chip tone={active.tone}>{active.signalLabel}</Chip>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {active.summary.map((s) => (
                  <div key={s.label} className="border-l pl-3" style={{ borderColor: LINE }}>
                    <Mono size={8}>{s.label}</Mono>
                    <p className="mt-2 text-[13px] font-semibold leading-none tabular-nums" style={{ color: INK }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 border py-1" style={{ borderColor: LINE_SOFT, background: '#FCFDFE' }}>
                {isLinda ? (
                  <WeightChart
                    upToWeek={step >= 2 ? 16 : 0}
                    domainWeeks={16}
                    highlightWeek={step >= 3 ? 16 : undefined}
                    className="h-[146px]"
                  />
                ) : (
                  <OtherChart values={active.chart} />
                )}
              </div>
            </div>

            <div
              className="mt-5"
              style={{
                opacity: step >= 3 ? 1 : 0,
                transform: step >= 3 ? 'none' : 'translateY(8px)',
                transition: reduced ? 'none' : `opacity .5s ${EASE}, transform .5s ${EASE}`,
              }}
            >
              <SignalCard tone={active.tone} {...active.signal} />
            </div>
          </div>

          {/* ── Right: the care that goes out ──────────────────── */}
          <div className="p-5 lg:p-6">
            <RightPanel step={step} patient={active} reduced={reduced} />
          </div>
        </div>

        {/* ── One loop indicator, in place of the old activity strip ── */}
        <div className="border-t px-4 py-4 sm:px-6" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <div className="flex items-center gap-2 sm:gap-3">
            {LOOP.map((name, i) => {
              const at = LOOP_AT[step];
              const passed = i <= at;
              const current = i === at;
              return (
                <span key={name} className="flex flex-1 items-center gap-2 sm:gap-3">
                  <span className="flex-1">
                    <span
                      className="block text-[10px]"
                      style={{
                        fontFamily: MONO,
                        letterSpacing: '.12em',
                        color: current ? BLUE : passed ? BODY : FAINT,
                        transition: reduced ? 'none' : `color .45s ${EASE}`,
                      }}
                    >
                      {name}
                    </span>
                    <span className="mt-2 block h-px w-full" style={{ background: LINE }}>
                      <span
                        className="block h-full"
                        style={{
                          background: BLUE,
                          width: passed ? '100%' : '0%',
                          transition: reduced ? 'none' : `width .6s ${EASE}`,
                        }}
                      />
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11.5px]" style={{ color: FAINT }}>
          Illustrative patient records.{' '}
          {manual ? 'You picked this patient, so the sequence stopped.' : done ? 'Pick another patient, or replay.' : ''}
        </p>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
          style={{ color: BLUE }}
        >
          Explore how it works
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 1v10M1.5 6.5 6 11l4.5-4.5" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/** The right column never swaps panels and never changes size. Every piece of
 *  the conversation is in place from the first frame and holds its own space;
 *  the sequence only brings each one up. Nothing mounts late, so nothing can
 *  push the card open as the story arrives. */
function RightPanel({ step, patient, reduced }: { step: number; patient: Patient; reduced: boolean }) {
  const prepared = step >= 4;
  const delivered = step >= 5;
  const opened = step >= 6;
  const replied = step >= 7;
  const hasVideo = Boolean(patient.message.attachment);

  /* One gesture for everything that arrives: a long fade and the gentlest lift. */
  const rise = (on: boolean, delay = 0) => ({
    opacity: on ? 1 : 0,
    transform: on ? 'none' : 'translateY(7px)',
    transition: reduced ? 'none' : `opacity .8s ${EASE} ${delay}ms, transform .8s ${EASE} ${delay}ms`,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Mono size={9}>{delivered ? 'Delivered to patient' : 'Care being prepared'}</Mono>
        <span style={{ opacity: delivered ? 1 : 0, transition: reduced ? 'none' : `opacity .6s ${EASE}` }}>
          <Chip tone="green">Approved pathway</Chip>
        </span>
      </div>

      <div className="mt-4 border" style={{ borderColor: LINE, background: '#FBFCFD' }}>
        {/* The window is there from the start. Delivery changes its state, not its shape. */}
        <div className="flex items-center gap-2.5 border-b px-3 py-2.5" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <span className="grid h-5 w-5 flex-none place-items-center text-[8px] font-bold text-white" style={{ background: BLUE_DEEP, fontFamily: MONO }}>
            BS
          </span>
          <span className="truncate text-[11.5px] font-semibold" style={{ color: INK }}>
            {PROVIDER}
          </span>
          <span
            className="ml-auto flex-none text-[9px]"
            style={{ color: delivered ? BLUE : FAINT, fontFamily: MONO, letterSpacing: '.1em', transition: reduced ? 'none' : `color .6s ${EASE}` }}
          >
            {delivered ? 'Sent' : 'Draft'}
          </span>
        </div>

        <div className="relative p-3">
          {/* The outline stands in for the whole exchange rather than leaving
              the card blank, and holds until the message is really sent. The
              caption goes as soon as there is a draft sitting inside it. */}
          <div
            className="pointer-events-none absolute inset-3 grid place-items-center border border-dashed"
            style={{ borderColor: LINE, opacity: delivered ? 0 : 1, transition: reduced ? 'none' : `opacity .7s ${EASE}` }}
          >
            <span style={{ opacity: prepared ? 0 : 1, transition: reduced ? 'none' : `opacity .5s ${EASE}` }}>
              <Mono size={9} colour={FAINT}>
                Nothing to send yet
              </Mono>
            </span>
          </div>

          {/* The bubble keeps its padding throughout. Only its surface arrives. */}
          <div
            style={{
              border: '1px solid transparent',
              borderColor: delivered ? LINE : 'transparent',
              background: delivered ? PAPER : 'transparent',
              padding: 10,
              transition: reduced ? 'none' : `border-color .7s ${EASE}, background .7s ${EASE}`,
            }}
          >
            <div className="border" style={{ borderColor: LINE_SOFT, ...rise(prepared) }} aria-hidden={!prepared}>
              {hasVideo ? (
                <VideoThumb
                  key={patient.id}
                  label={patient.message.attachment ?? ''}
                  points={patient.videoLine}
                  upToWeek={patient.videoLine?.[patient.videoLine.length - 1]?.week ?? 16}
                  scenes={patient.videoScenes}
                  play={prepared}
                  spaciousCaption
                />
              ) : (
                <div className="grid w-full place-items-center px-2 text-center" style={{ aspectRatio: '16 / 9', background: CANVAS }}>
                  <Mono size={9} colour={FAINT}>
                    Text only · no video
                  </Mono>
                </div>
              )}
            </div>

            {/* Three lines are reserved whatever the message says, so a longer
                one does not make the card taller than a shorter one. */}
            <div style={rise(delivered, 80)} aria-hidden={!delivered}>
              <p className="pt-2.5 text-[11.5px] leading-[1.55]" style={{ color: INK, minHeight: 54 }}>
                {patient.message.body}
              </p>
              <span className="mt-1.5 flex items-center justify-end gap-1">
                <span className="text-[9px]" style={{ color: FAINT, fontFamily: MONO }}>
                  Lina
                </span>
                <svg viewBox="0 0 16 12" className="h-2.5 w-2.5" fill="none" stroke={opened ? BLUE : MUTED} strokeWidth="2" strokeLinecap="round" style={{ transition: reduced ? 'none' : `stroke .6s ${EASE}` }}>
                  <path d="M1 6.5 4.5 10 11 2" />
                </svg>
                <svg viewBox="0 0 16 12" className="-ml-[7px] h-2.5 w-2.5" fill="none" stroke={opened ? BLUE : MUTED} strokeWidth="2" strokeLinecap="round" style={{ transition: reduced ? 'none' : `stroke .6s ${EASE}` }}>
                  <path d="M1 6.5 4.5 10 11 2" />
                </svg>
              </span>
            </div>
          </div>

          {/* The reply travels back and becomes a record. */}
          <div className="mt-3 flex justify-end" style={rise(replied, 120)} aria-hidden={!replied}>
            <p
              className="max-w-[88%] border px-3 py-2.5 text-[11.5px] leading-[1.55]"
              style={{ background: BLUE_WASH, borderColor: BLUE_SOFT, color: INK, minHeight: 36 }}
            >
              {patient.id === 'linda'
                ? 'Watched it. Can I book in to talk about the strength part?'
                : 'Thanks, that is useful'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 border-l pl-3" style={{ borderColor: BLUE, ...rise(replied, 240) }} aria-hidden={!replied}>
        <Mono size={8} colour={BLUE}>
          Added to record
        </Mono>
        <p className="mt-1.5 text-[11.5px] leading-tight" style={{ color: BODY }}>
          {patient.outcome}
        </p>
      </div>
    </div>
  );
}

function OtherChart({ values }: { values: number[] }) {
  const min = Math.min(...values) - 1.5;
  const max = Math.max(...values) + 1.5;
  const span = max - min;
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${38 + (i / (values.length - 1)) * 464} ${16 + (1 - (v - min) / span) * 112}`).join(' ');
  return (
    <svg viewBox="0 0 520 142" className="h-[146px] w-full" aria-hidden="true">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="38" x2="502" y1={16 + f * 112} y2={16 + f * 112} stroke={LINE_SOFT} strokeWidth="1" />
      ))}
      <path d={d} fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <rect key={i} x={38 + (i / (values.length - 1)) * 464 - 3} y={16 + (1 - (v - min) / span) * 112 - 3} width="6" height="6" fill={BLUE} stroke="#fff" strokeWidth="1.2" />
      ))}
    </svg>
  );
}
