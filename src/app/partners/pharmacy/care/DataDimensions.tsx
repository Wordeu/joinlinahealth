'use client';

import { sceneProgress, useSceneValue } from './ScrollScene';
import {
  BLUE,
  BLUE_DEEP,
  BLUE_MID,
  BLUE_SOFT,
  BLUE_WASH,
  BODY,
  CANVAS,
  Chip,
  FAINT,
  Frame,
  INK,
  LINE,
  LINE_SOFT,
  MONO,
  MUTED,
  Mono,
  PAPER,
} from './ui';
import { Sparkline, WeightChart } from './charts';
import { VideoThumb } from './atoms';

/* Six different pictures because the six underlying things are different.
   Nothing here repeats the same squiggle with a new label. */

type Dim = {
  id: string;
  name: string;
  unit: string;
  viz: React.ReactNode;
  headline: string;
  body: string;
  change: string;
  detail: React.ReactNode;
};

function DoseSteps() {
  const doses = [2.5, 2.5, 5, 5, 5, 7.5, 7.5, 7.5];
  return (
    <div className="flex h-[58px] items-end gap-[3px]">
      {doses.map((d, i) => (
        <span key={i} className="flex-1" style={{ height: `${(d / 7.5) * 100}%`, background: i > 4 ? BLUE : i > 1 ? BLUE_MID : BLUE_SOFT }} />
      ))}
    </div>
  );
}

function Stacked() {
  // Baseline against month 4. Fat came down far further than lean did.
  const rows = [
    { label: 'Fat', from: 38.6, to: 31.8, colour: BLUE },
    { label: 'Lean', from: 51.9, to: 49.7, colour: BLUE_DEEP },
  ];
  return (
    <div className="flex h-[58px] flex-col justify-center gap-3">
      {rows.map((r) => (
        <span key={r.label} className="flex items-center gap-2">
          <span className="w-7 flex-none text-[8px]" style={{ fontFamily: MONO, color: MUTED, letterSpacing: '.08em' }}>
            {r.label}
          </span>
          <span className="relative h-[14px] flex-1" style={{ background: '#E9ECEF' }}>
            <span className="absolute inset-y-0 left-0" style={{ width: `${(r.to / r.from) * 100}%`, background: r.colour }} />
          </span>
        </span>
      ))}
    </div>
  );
}

function Reports() {
  const weeks = [0, 2, 2, 1, 0, 0, 0, 0, 0, 1, 0, 0];
  return (
    <div className="flex h-[58px] items-end gap-[4px]">
      {weeks.map((n, i) => (
        <span key={i} className="flex flex-1 flex-col-reverse gap-[2px]">
          {[0, 1, 2].map((r) => (
            <span key={r} className="aspect-square w-full" style={{ background: r < n ? BLUE : '#E9ECEF' }} />
          ))}
        </span>
      ))}
    </div>
  );
}

function Engagement() {
  const sent = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const read = [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1];
  return (
    <div className="flex h-[58px] flex-col justify-center gap-[5px]">
      {[sent, read].map((series, r) => (
        <div key={r} className="flex gap-[3px]">
          {series.map((v, i) => (
            <span key={i} className="h-[14px] flex-1" style={{ background: v ? (r === 0 ? BLUE_SOFT : BLUE) : '#E9ECEF' }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Refills() {
  const on = [1, 1, 1, 1, 1, 1, 0, 1];
  return (
    <div className="flex h-[58px] items-center gap-0">
      {on.map((v, i) => (
        <span key={i} className="flex flex-1 items-center">
          <span className="h-[14px] w-[14px] flex-none" style={{ background: v ? BLUE : PAPER, border: v ? 'none' : `1.5px dashed #BA3A2E` }} />
          {i < on.length - 1 ? <span className="h-px flex-1" style={{ background: LINE }} /> : null}
        </span>
      ))}
    </div>
  );
}

const DIMS: Dim[] = [
  {
    id: 'medication',
    name: 'Medication',
    unit: 'Dose and treatment history',
    viz: <DoseSteps />,
    headline: 'Where she is in the treatment, not just that she is on it.',
    body: 'Two dose steps in four months, both tolerated. That tells you which message is appropriate this week, and which one would be wrong.',
    change: '8 collections · 2 dose steps',
    detail: null,
  },
  {
    id: 'weight',
    name: 'Weight',
    unit: 'Progress and trend',
    viz: <Sparkline values={[94, 92.8, 91.9, 90.1, 87.6, 85, 84.2, 83.8]} height={58} />,
    headline: 'The shape of the curve says more than the number.',
    body: 'Steady for four months, then flat for two. A plateau is a conversation about what happens next, not a reminder to try harder.',
    change: '−10.2 kg over six months',
    detail: null,
  },
  {
    id: 'composition',
    name: 'Body composition',
    unit: 'Measured fat and lean mass',
    viz: <Stacked />,
    headline: 'Two scans turn one number into two.',
    body: 'Of the 9 kg she lost by month 4, the scan put 6.8 kg on fat mass and 2.2 kg on lean. That changes the advice from "keep going" to "protect the lean tissue".',
    change: 'Fat −6.8 kg · lean −2.2 kg',
    detail: 'video',
  },
  {
    id: 'symptoms',
    name: 'Symptoms',
    unit: 'What the patient reports',
    viz: <Reports />,
    headline: 'Side effects have a pattern, and the pattern matters.',
    body: 'Two reports in week 2, one in week 10 after a dose step. The first pair was routine guidance. The second went to a pharmacist.',
    change: '5 reports · 1 escalated',
    detail: null,
  },
  {
    id: 'engagement',
    name: 'Engagement',
    unit: 'Check-ins and replies',
    viz: <Engagement />,
    headline: 'Who is still listening.',
    body: 'Eleven of fourteen messages read. Someone who stops opening things is often someone about to stop treatment, and that is worth knowing early.',
    change: '79% read · 6 replies',
    detail: null,
  },
  {
    id: 'refills',
    name: 'Refills',
    unit: 'Continuity and reorder pattern',
    viz: <Refills />,
    headline: 'A missed reorder is the clearest signal there is.',
    body: 'Six refills within three days of the due date, then nothing for 37. That is the moment to ask a question, not to send another reminder.',
    change: '1 gap in 8 cycles',
    detail: 'refill',
  },
];

export default function DataDimensions({ progress = null }: { progress?: number | null }) {
  const step = progress === null ? 0 : Math.min(DIMS.length - 1, Math.floor(sceneProgress(progress) * DIMS.length));
  const [open, setOpen] = useSceneValue<string | null>(progress, DIMS[step].id, 'composition');
  const selected = DIMS.find((d) => d.id === open) ?? null;

  return (
    <div data-scene-step={step}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DIMS.map((d, i) => {
          const on = open === d.id;
          const quiet = open !== null && !on;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setOpen(on ? null : d.id)}
              aria-expanded={on}
              className="border p-3.5 text-left transition-all duration-300"
              style={{
                borderColor: on ? BLUE : LINE,
                background: on ? BLUE_WASH : PAPER,
                opacity: quiet ? 0.62 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold leading-none tracking-[-.015em]" style={{ color: INK }}>
                    {d.name}
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-tight" style={{ color: MUTED }}>
                    {d.unit}
                  </p>
                </div>
                <Mono size={10} colour={on ? BLUE : FAINT}>
                  {String(i + 1).padStart(3, '0')}
                </Mono>
              </div>
              <Frame className="mt-3" inset={8}>
                <div className="px-1">{d.viz}</div>
              </Frame>
              <p className="mt-2 text-[10.5px]" style={{ color: on ? BLUE : FAINT, fontFamily: MONO, letterSpacing: '.05em' }}>
                {d.change}
              </p>
            </button>
          );
        })}
      </div>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-400 ease-out"
        style={{ gridTemplateRows: selected ? '1fr' : '0fr', opacity: selected ? 1 : 0, marginTop: selected ? 12 : 0 }}
      >
        <div className="overflow-hidden">
          {selected ? (
            <div className="border" style={{ borderColor: BLUE_SOFT, background: CANVAS }}>
              <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: BLUE_SOFT, background: BLUE_WASH }}>
                <Mono size={9} colour={BLUE}>
                  {selected.name} · what it changes
                </Mono>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="text-[11px] font-medium transition-opacity hover:opacity-60"
                  style={{ color: BLUE }}
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
                <div>
                  <p className="max-w-[460px] text-[19px] font-normal leading-[1.3] tracking-[-.025em]" style={{ color: INK }}>
                    {selected.headline}
                  </p>
                  <p className="mt-3 max-w-[460px] text-[13.5px] leading-[1.65]" style={{ color: BODY }}>
                    {selected.body}
                  </p>
                  <p className="mt-4 border-l pl-3 text-[12px] leading-[1.55]" style={{ borderColor: BLUE_SOFT, color: MUTED }}>
                    Not every provider has this. Where a source is missing, the record says missing rather than guessing.
                  </p>
                </div>
                <div>
                  {selected.detail === 'video' ? (
                    <div className="border bg-white" style={{ borderColor: LINE }}>
                      <VideoThumb label="Your 4-month review · 40s" />
                      <p className="border-t px-2.5 py-2 text-[11px] leading-[1.45]" style={{ borderColor: LINE_SOFT, color: BODY }}>
                        The scan becomes the content of her video, and the reason to book a conversation.
                      </p>
                    </div>
                  ) : selected.detail === 'refill' ? (
                    <div className="border bg-white p-3" style={{ borderColor: LINE }}>
                      <Mono size={9}>Suggested</Mono>
                      <p className="mt-2 text-[12.5px] font-semibold leading-tight" style={{ color: INK }}>
                        Ask Rachel whether she means to carry on
                      </p>
                      <p className="mt-1.5 text-[11.5px] leading-[1.5]" style={{ color: BODY }}>
                        Nine days past her usual reorder, after six on time.
                      </p>
                      <div className="mt-2.5">
                        <Chip tone="green">Approved pathway</Chip>
                      </div>
                    </div>
                  ) : (
                    <div className="border bg-white" style={{ borderColor: LINE, background: '#FCFDFE' }}>
                      <WeightChart upToWeek={24} className="h-[150px]" />
                      <p className="border-t px-2.5 py-2 text-[11px] leading-[1.45]" style={{ borderColor: LINE_SOFT, color: BODY }}>
                        Everything here sits against the same timeline, which is what lets one source explain another.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-[12.5px] leading-[1.6]" style={{ color: BODY }}>
        Knowing someone is due a refill is one thing. Knowing they have stopped opening your messages, lost mostly fat
        rather than muscle, and asked twice about nausea is a different conversation.
      </p>
    </div>
  );
}
