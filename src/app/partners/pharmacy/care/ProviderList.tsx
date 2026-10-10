'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SceneViewport, sceneProgress, useSceneHeight, useSceneValue } from './ScrollScene';
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
  Rect,
  useInView,
  useReducedMotion,
} from './ui';
import { ActionCard, SignalCard, VideoThumb } from './atoms';
import { PATIENTS, PROVIDER, QUIET_PATIENTS, type Patient } from './data';

const ROW_H = 'var(--patient-row-height)';

type Row = {
  id: string;
  initials: string;
  name: string;
  treatment: string;
  stage: string;
  lastActivity: string;
  patient?: Patient;
};

const ROWS: Row[] = [
  { ...QUIET_PATIENTS[0] },
  { id: 'linda', initials: 'LH', name: 'Linda Hartley', treatment: 'Tirzepatide 7.5 mg', stage: 'Month 4', lastActivity: 'Scan · 2 days ago', patient: PATIENTS[0] },
  { ...QUIET_PATIENTS[1] },
  { ...QUIET_PATIENTS[2] },
  { id: 'rachel', initials: 'RO', name: 'Rachel Okafor', treatment: 'Semaglutide 1.0 mg', stage: 'Month 7', lastActivity: 'Dispensed · 37 days ago', patient: PATIENTS[1] },
  { ...QUIET_PATIENTS[3] },
  { id: 'sofia', initials: 'SM', name: 'Sofia Marchetti', treatment: 'Tirzepatide 2.5 mg', stage: 'Week 8', lastActivity: 'Weigh-in · yesterday', patient: PATIENTS[3] },
  { ...QUIET_PATIENTS[4] },
  { id: 'david', initials: 'DM', name: 'David Mensah', treatment: 'Tirzepatide 5 mg', stage: 'Week 3', lastActivity: 'Message · 4 hours ago', patient: PATIENTS[2] },
  { ...QUIET_PATIENTS[5] },
  { ...QUIET_PATIENTS[6] },
];

const PRIORITY_ORDER = ['linda', 'rachel', 'david', 'sofia'];

export default function ProviderList({ progress = null }: { progress?: number | null }) {
  const reduced = useReducedMotion();
  const height = useSceneHeight();
  const position = progress === null ? null : sceneProgress(progress) * 6;
  const phase = position === null ? null : position - Math.min(5, Math.floor(position));
  const step = progress === null ? 0 : Math.min(5, Math.floor(sceneProgress(progress) * 6));
  const [{ sorted, selected }, select] = useSceneValue<{ sorted: boolean; selected: string | null }>(
    progress,
    { sorted: step > 0, selected: step >= 2 ? PRIORITY_ORDER[step - 2] : null },
    { sorted: true, selected: 'linda' },
  );
  const [acted, setActed] = useState<Record<string, boolean>>({});

  const positions = useMemo(() => {
    const map: Record<string, number> = {};
    if (!sorted) {
      ROWS.forEach((r, i) => {
        map[r.id] = i;
      });
      return map;
    }
    const rest = ROWS.filter((r) => !PRIORITY_ORDER.includes(r.id));
    PRIORITY_ORDER.forEach((id, i) => {
      map[id] = i;
    });
    rest.forEach((r, i) => {
      map[r.id] = PRIORITY_ORDER.length + i;
    });
    return map;
  }, [sorted]);

  const active = selected ? ROWS.find((r) => r.id === selected)?.patient ?? null : null;

  const pick = useCallback((id: string) => {
    select({ sorted, selected: id });
  }, [sorted, select]);

  return (
    <div data-scene-step={step}>
      <div className="flex flex-col border bg-white" style={{ borderColor: LINE, maxHeight: height === null ? undefined : height - 32 }}>
        <div className="flex flex-none flex-wrap items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <div className="flex items-center gap-2.5">
            <span className="grid h-5 w-5 place-items-center text-[8px] font-bold text-white" style={{ background: BLUE_DEEP, fontFamily: MONO }}>
              BS
            </span>
            <Mono size={9} colour={BODY}>
              {PROVIDER} · {ROWS.length} patients on treatment
            </Mono>
          </div>
          <GhostButton
            active={sorted}
            onClick={() => {
              select({ sorted: !sorted, selected: sorted ? null : selected });
            }}
          >
            {sorted ? "This week's priorities" : 'Prioritise patients'}
          </GhostButton>
        </div>

        <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,384px)] lg:grid-rows-[minmax(0,1fr)]">
          <SceneViewport progress={phase}>
          <div className="care-patient-list min-w-0 border-b lg:border-b-0 lg:border-r" style={{ borderColor: LINE_SOFT }}>
            <div className="care-patient-grid items-center border-b px-3 py-2 sm:px-4" style={{ borderColor: LINE_SOFT }}>
              <span className="w-[26px]" />
              <Mono size={8}>Patient</Mono>
              <Mono size={8} className="hidden sm:block">
                Last activity
              </Mono>
              <Mono size={8} className="hidden sm:block">
                Status
              </Mono>
            </div>

            <div className="relative" style={{ height: `calc(${ROWS.length} * ${ROW_H})` }}>
              {ROWS.map((row) => {
                const pos = positions[row.id];
                const priority = sorted && PRIORITY_ORDER.includes(row.id);
                const quiet = sorted && !priority;
                const on = selected === row.id;
                const p = row.patient;
                const status = p ? (acted[row.id] ? p.outcome : p.signalLabel) : 'Nothing outstanding';
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => (p ? pick(row.id) : undefined)}
                    aria-pressed={on}
                    disabled={!p}
                    className="care-patient-row care-patient-grid absolute left-0 right-0 items-center border-b px-3 text-left sm:px-4"
                    style={{
                      height: ROW_H,
                      borderColor: LINE_SOFT,
                      transform: `translateY(calc(${pos} * ${ROW_H}))`,
                      transition: reduced
                        ? 'none'
                        : 'transform .55s cubic-bezier(.22,.61,.36,1), opacity .4s ease-out, background .2s ease-out',
                      opacity: quiet ? 0.42 : 1,
                      background: on ? BLUE_WASH : PAPER,
                      boxShadow: on ? `inset 2px 0 0 ${BLUE}` : 'none',
                      cursor: p ? 'pointer' : 'default',
                      zIndex: on ? 2 : 1,
                    }}
                  >
                    <Avatar initials={row.initials} size={26} active={on} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold leading-tight" style={{ color: INK }}>
                        {row.name}
                      </span>
                      <span className="mt-[3px] block truncate text-[10px] leading-tight" style={{ color: MUTED, fontFamily: MONO, letterSpacing: '.03em' }}>
                        {row.treatment} · {row.stage}
                      </span>
                    </span>
                    <span className="hidden truncate text-[10.5px] sm:block" style={{ color: FAINT, fontFamily: MONO }}>
                      {row.lastActivity}
                    </span>
                    <span className="min-w-0 justify-self-start overflow-hidden">
                      {p ? (
                        <Chip tone={acted[row.id] ? 'green' : p.tone}>{status}</Chip>
                      ) : (
                        <Mono size={8} colour={FAINT}>
                          Nothing due
                        </Mono>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          </SceneViewport>

          {/* The panel changes contents. It never closes and reopens. */}
          <SceneViewport progress={phase} className="care-detail-pane">
          <div className="relative flex flex-1 flex-col" style={{ minHeight: 380 }}>
            {active ? (
              <DetailPanel
                key="panel"
                patient={active}
                done={Boolean(acted[active.id])}
                onAct={() => setActed((a) => ({ ...a, [active.id]: true }))}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <Mono size={9} colour={FAINT}>
                    No patient selected
                  </Mono>
                  <p className="mx-auto mt-2.5 max-w-[240px] text-[12.5px] leading-[1.55]" style={{ color: BODY }}>
                    Prioritise the list, then open a patient to see why they surfaced and what Lina has prepared.
                  </p>
                </div>
              </div>
            )}

            {/* The space under a short panel says the quiet part out loud:
                the rest of the list is not waiting on anyone. */}
            <div className="mt-auto border-t px-3 py-2.5 sm:px-4" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
              <Mono size={9} colour={FAINT}>
                {QUIET_PATIENTS.length} other patients are on treatment and need nothing this week
              </Mono>
            </div>
          </div>
          </SceneViewport>
        </div>
      </div>

      <p className="mt-3 text-[11.5px]" style={{ color: FAINT }}>
        Four patients out of eleven need something this week. Lina decides nothing clinical, it decides what to put in front of you.
      </p>

    </div>
  );
}

function DetailPanel({ patient, done, onAct }: { patient: Patient; done: boolean; onAct: () => void }) {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar initials={patient.initials} size={32} active />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-none" style={{ color: INK }}>
              {patient.name}, {patient.age}
            </p>
            <Mono size={9} colour={MUTED} className="mt-1.5 truncate">
              {patient.treatment} · {patient.stage}
            </Mono>
          </div>
        </div>
        <span className="flex-none">
          <Chip tone={done ? 'green' : patient.tone}>{done ? 'Done' : patient.signalLabel}</Chip>
        </span>
      </div>

      {/* The panel is why this patient surfaced and what Lina has drafted, in
          that order, and it fits without scrolling. Her measurements are in the
          signal's evidence line; the line she will see is inside the draft. */}

      <div className="mt-3">
        <SignalCard tone={patient.tone} {...patient.signal} compact />
      </div>

      <div className="mt-2">
        <ActionCard {...patient.action} state={done ? 'done' : 'proposed'} onAct={onAct} compact />
      </div>

      <div className="mt-2 border" style={{ borderColor: LINE_SOFT }}>
        {/* The approval is stated once, on the action above. */}
        <div className="flex items-center justify-between border-b px-2.5 py-1.5" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <Mono size={8}>{done ? 'Sent to patient' : 'Draft'}</Mono>
        </div>
        <div className="p-2.5">
          {patient.message.attachment ? (
            <div className="mb-2 border" style={{ borderColor: LINE_SOFT }}>
              <VideoThumb
                label={patient.message.attachment}
                points={patient.videoLine}
                upToWeek={patient.videoLine?.[patient.videoLine.length - 1]?.week ?? 16}
                scenes={patient.videoScenes}
              />
            </div>
          ) : null}
          <p className="text-[11.5px] leading-[1.5]" style={{ color: INK }}>
            {patient.message.body}
          </p>
        </div>
      </div>

      <div
        className="mt-2 grid transition-[grid-template-rows,opacity] duration-400 ease-out"
        style={{ gridTemplateRows: done ? '1fr' : '0fr', opacity: done ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="border-l pl-2.5" style={{ borderColor: '#0E9A62' }}>
            <Mono size={8} colour="#0E9A62">
              Outcome
            </Mono>
            <p className="mt-1 text-[11px] leading-[1.45]" style={{ color: BODY }}>
              {patient.outcome}. It is back on the record, and the next message knows about it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── The two smaller cards underneath ───────────────────────────────── */

export function PharmacyWorkflow({ progress = null }: { progress?: number | null }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.08);
  const reduced = useReducedMotion();
  const [timedFlip, setFlip] = useState(false);
  const [timedCleared, setCleared] = useState(0);
  const step = progress === null ? null : Math.min(4, Math.floor(sceneProgress(progress) * 5));
  const flip = step === null ? timedFlip : step >= 1;
  const cleared = step === null ? timedCleared : Math.max(0, step - 1);

  useEffect(() => {
    if (!inView || progress !== null) return;
    if (reduced) {
      setFlip(true);
      setCleared(3);
      return;
    }
    const a = setTimeout(() => setFlip(true), 800);
    const timers = [0, 1, 2].map((i) => setTimeout(() => setCleared(i + 1), 700 + i * 520));
    return () => {
      clearTimeout(a);
      timers.forEach(clearTimeout);
    };
  }, [inView, reduced, progress]);

  const tasks = [
    { label: 'Four-month reviews prepared', count: 12, auto: true },
    { label: 'Refill check-ins sent', count: 7, auto: true },
    { label: 'Progress videos delivered', count: 23, auto: true },
  ];

  return (
    <div ref={ref} data-scene-step={step ?? cleared} className="grid gap-4 sm:grid-cols-2">
      <Rect className="p-4">
        <p className="text-[14px] font-semibold tracking-[-.01em]" style={{ color: INK }}>
          Your patients, your brand.
        </p>
        <p className="mt-1.5 text-[12.5px] leading-[1.55]" style={{ color: BODY }}>
          Everything a patient sees carries the pharmacy’s name. Lina is the thing behind it.
        </p>
        <div className="mt-3.5 border" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <div className="p-3">
            <div
              className="border bg-white p-2.5 transition-all duration-700 ease-out"
              style={{ borderColor: flip ? BLUE_SOFT : LINE_SOFT }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-6 w-6 flex-none place-items-center text-[8px] font-bold transition-colors duration-500"
                  style={{ background: flip ? BLUE_DEEP : '#C9CFD6', color: '#fff', fontFamily: MONO }}
                >
                  {flip ? 'BS' : 'L'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-semibold leading-none" style={{ color: INK }}>
                    {flip ? PROVIDER : 'Lina Health'}
                  </p>
                  <Mono size={8} colour={FAINT} className="mt-1">
                    {flip ? 'What the patient sees' : 'What Lina prepared'}
                  </Mono>
                </div>
              </div>
              <p className="mt-2.5 text-[11px] leading-[1.5]" style={{ color: BODY }}>
                Linda, your four-month review is ready.
              </p>
            </div>
          </div>
        </div>
      </Rect>

      <Rect className="p-4">
        <p className="text-[14px] font-semibold tracking-[-.01em]" style={{ color: INK }}>
          Built around your workflow.
        </p>
        <p className="mt-1.5 text-[12.5px] leading-[1.55]" style={{ color: BODY }}>
          Routine work clears itself. What is left on the screen is the part that needs a person.
        </p>
        <div className="mt-3.5 border" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <ul className="divide-y" style={{ borderColor: LINE_SOFT }}>
            {tasks.map((t, i) => {
              const gone = i < cleared;
              return (
                <li
                  key={t.label}
                  className="flex items-center justify-between gap-3 border-b px-3 py-2 transition-all duration-500"
                  style={{ borderColor: LINE_SOFT, opacity: gone ? 0.38 : 1 }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="grid h-3.5 w-3.5 flex-none place-items-center transition-colors duration-300"
                      style={{ background: gone ? '#0E9A62' : LINE }}
                    >
                      {gone ? (
                        <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
                          <path d="M2 6.2 4.6 9 10 3" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="text-[11.5px]" style={{ color: INK, textDecoration: gone ? 'line-through' : 'none' }}>
                      {t.label}
                    </span>
                  </span>
                  <Mono size={8} colour={FAINT}>
                    {t.count}
                  </Mono>
                </li>
              );
            })}
            <li className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 flex-none border" style={{ borderColor: '#BA3A2E' }} />
                <span className="text-[11.5px] font-medium" style={{ color: INK }}>
                  David Mensah · clinical review
                </span>
              </span>
              <Chip tone="red">Waiting</Chip>
            </li>
          </ul>
        </div>
      </Rect>
    </div>
  );
}
