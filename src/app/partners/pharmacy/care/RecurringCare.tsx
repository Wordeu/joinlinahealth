'use client';

import { useSceneStep } from './ScrollScene';
import {
  BLUE,
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
} from './ui';

const LOOP = ['Patient data', 'Relevant signals', 'Personalised care', 'New information'];

const CATEGORIES = [
  {
    id: 'glp1',
    name: 'GLP-1 and metabolic health',
    status: 'Building now',
    live: true,
    examples: ['Weight, scans and dose history', 'Four-month review ready', 'Progress video and a booking', 'Watched it, asked about strength'],
  },
  {
    id: 'menopause',
    name: 'Menopause',
    status: 'Later',
    live: false,
    examples: ['HRT history and reported symptoms', 'Symptoms unchanged at week 12', 'What a dose review involves', 'Booked a review'],
  },
  {
    id: 'trt',
    name: 'Testosterone therapy',
    status: 'Later',
    live: false,
    examples: ['Dosing, bloods and injection dates', 'Bloods due before the next script', 'Reminder with the booking link', 'Bloods taken'],
  },
  {
    id: 'bariatric',
    name: 'Post-bariatric care',
    status: 'Later',
    live: false,
    examples: ['Surgery date, weight and supplements', 'Supplement reorder overdue', 'Why it matters, how to restart', 'Reordered'],
  },
];

export default function RecurringCare({ progress = null }: { progress?: number | null }) {
  const [step, setStep] = useSceneStep(progress, CATEGORIES.length);
  const cat = CATEGORIES[step];
  const active = cat.id;

  return (
    <div data-scene-step={step}>
      <div className="grid gap-0 border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: LINE }}>
        {CATEGORIES.map((c, i) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setStep(i)}
              aria-pressed={on}
              className="border-b p-4 text-left transition-colors duration-200 sm:border-b-0 sm:border-r last:sm:border-r-0 lg:border-b-0"
              style={{
                borderColor: LINE,
                background: on ? BLUE_WASH : PAPER,
              }}
            >
              <div className="flex h-[18px] items-center justify-between gap-2">
                <Mono size={10} colour={on ? BLUE : FAINT}>
                  {String(i + 1).padStart(3, '0')}
                </Mono>
                {c.live ? <Chip tone="green">Now</Chip> : <Mono size={8} colour={FAINT}>Later</Mono>}
              </div>
              <p className="mt-3 text-[14px] font-semibold leading-[1.3] tracking-[-.015em]" style={{ color: on ? INK : MUTED }}>
                {c.name}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-3 border" style={{ borderColor: LINE, background: CANVAS }}>
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
          {LOOP.map((stage, i) => (
            <div
              key={stage}
              className="relative border-b border-r p-4 last:border-r-0 lg:border-b-0"
              style={{ borderColor: LINE_SOFT }}
            >
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 flex-none place-items-center text-[9px] font-bold text-white" style={{ background: BLUE, fontFamily: MONO }}>
                  {i + 1}
                </span>
                <Mono size={9} colour={BODY}>
                  {stage}
                </Mono>
              </div>
              <p
                key={`${cat.id}-${i}`}
                className="care-fade mt-3 min-h-[40px] text-[12.5px] leading-[1.5]"
                style={{ color: INK }}
              >
                {cat.examples[i]}
              </p>
              {i < LOOP.length - 1 ? (
                <svg viewBox="0 0 10 10" className="absolute -right-[5px] top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 lg:block" fill={BLUE_SOFT} aria-hidden="true">
                  <path d="M2 0l6 5-6 5z" />
                </svg>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5" style={{ borderColor: LINE_SOFT, background: PAPER }}>
          <Mono size={9} colour={FAINT}>
            Same four steps · {cat.name.toLowerCase()}
          </Mono>
          <p className="text-[11.5px]" style={{ color: BODY }}>
            {cat.live
              ? 'This is the one we are building. The rest is the same machine with different signals.'
              : 'Not built. Shown to make the point that the architecture does not change.'}
          </p>
        </div>
      </div>
    </div>
  );
}
