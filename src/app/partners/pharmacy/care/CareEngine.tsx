'use client';

import { useEffect, useState } from 'react';
import ScrollScene, { SceneViewport, sceneProgress, useSceneHeight, type SceneState } from './ScrollScene';
import {
  Avatar,
  BLUE,
  BLUE_SOFT,
  BLUE_WASH,
  BODY,
  CANVAS,
  FAINT,
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
import { SignalCard, ActionCard, Thread, VideoThumb } from './atoms';
import { LINDA_MOMENTS, PROVIDER } from './data';

const MONTH4 = LINDA_MOMENTS[3];

export const STAGES = [
  {
    id: 'read',
    name: 'Read',
    lead: 'Share the patient data your pharmacy already has.',
    body: 'Send a secure download of the patient data you already hold under an NDA, or connect Lina via API. You can delete it fully at any time. Lina then brings refills, weigh-ins, scans, and patient replies into one clear record.',
    foot: 'No new data collection. No new system for your team to learn.',
  },
  {
    id: 'analyse',
    name: 'Analyse',
    lead: 'AI analysis, with clear safeguards.',
    body: 'Lina’s AI compares measurements, refill history and patient replies over time. Each observation stays linked to the records behind it, with gaps in the data made clear. Anything clinical goes to a pharmacist or prescriber for review.',
    foot: 'Your pharmacy stays in control. You can delete the data fully at any time.',
  },
  {
    id: 'detect',
    name: 'Detect',
    lead: 'Find the moments worth a response.',
    body: 'A refill that has not appeared. A side effect reported twice. A scan that can be compared against a baseline. Each signal carries what changed and the records behind it.',
    foot: 'Signals are read off the record, not predicted. Nothing here claims to be a diagnosis.',
  },
  {
    id: 'decide',
    name: 'Decide',
    lead: 'Turn the signal into one next action.',
    body: 'Routine communications run on an approved pathway. Anything clinical waits for a pharmacist or prescriber, and the interface says which is which.',
    foot: 'Lina prepares. A human decides anything clinical.',
  },
  {
    id: 'deliver',
    name: 'Deliver',
    lead: 'Reach patients on the device they use every day.',
    body: 'Send through WhatsApp, email, iMessage, push notifications, or post under the pharmacy’s name. Use the channel each patient is most likely to see. What they do next goes back into the record.',
    foot: 'The reply matters. It helps Lina make the next message more useful.',
  },
];

const SOURCES = [
  { label: 'Dispensing', value: '6 collections' },
  { label: 'Reorders', value: 'Every 28 days' },
  { label: 'Weigh-ins', value: '8 readings' },
  { label: 'Body scans', value: '2 on file' },
  { label: 'Replies', value: 'Nausea ×2' },
  { label: 'Messages', value: '14 sent · 11 read' },
];

/** Three headline values, filled as the sources land. */
const FIELDS = [
  { label: 'On treatment', value: 'Month 4', at: 1 },
  { label: 'Weight', value: '85.0 kg · −9.0' , at: 3 },
  { label: 'Composition', value: 'Fat −6.8 · lean −2.2', at: 4 },
];

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'imessage', label: 'iMessage' },
  { id: 'push', label: 'Push' },
  { id: 'post', label: 'Post' },
] as const;

type ChannelId = (typeof CHANNELS)[number]['id'];

function ChannelIcon({ channel }: { channel: ChannelId }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (channel === 'email') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect {...common} x="3" y="5" width="18" height="14" rx="1.5" />
        <path {...common} d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (channel === 'post') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path {...common} d="M3.5 7.5h10v9h-10zM13.5 10h3.8l3.2 3v3.5h-7" />
        <path {...common} d="M17.3 10v3h3.2M3.5 16.5h17" />
        <circle {...common} cx="7" cy="18.5" r="1.5" />
        <circle {...common} cx="17.5" cy="18.5" r="1.5" />
      </svg>
    );
  }

  if (channel === 'push') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path {...common} d="M6.5 16.5h11l-1.4-2.1V10a4.1 4.1 0 0 0-8.2 0v4.4L6.5 16.5Z" />
        <path {...common} d="M10 19a2.2 2.2 0 0 0 4 0M12 3v1" />
      </svg>
    );
  }

  if (channel === 'imessage') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path {...common} d="M4 5.5h12a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 3v-3.2a3 3 0 0 1-1-2.3v-4.5a3 3 0 0 1 3-3Z" />
        <path {...common} d="M8 11h.01M11 11h.01M14 11h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path {...common} d="M20 11.5a8 8 0 0 1-11.7 7L4 20l1.7-4.1A8 8 0 1 1 20 11.5Z" />
      <path {...common} d="M9 8.5c.3-.4.6-.4.9-.2l1.1 1.4c.2.3.2.6 0 .8l-.6.6c.5 1 1.2 1.7 2.2 2.2l.6-.6c.2-.2.5-.2.8 0l1.4 1.1c.2.2.2.6-.2.9-.5.5-1.3.6-2.1.3-2.1-.8-4.2-2.9-5-5-.3-.8-.2-1.6.3-2.1Z" />
    </svg>
  );
}

export default function CareEngine() {
  return (
    <ScrollScene name="care-engine" beats={STAGES.length * 1.5} index="003" title="How Lina works" panels>
      {(scene) => <EngineSequence {...scene} />}
    </ScrollScene>
  );
}

function EngineSequence({ progress, seek }: SceneState) {
  const [manualStage, setStage] = useState(0);
  const position = progress === null ? null : sceneProgress(progress) * STAGES.length;
  const stage = position === null ? manualStage : Math.min(STAGES.length - 1, Math.floor(position));
  const goTo = (index: number) => {
    if (progress === null) setStage(index);
    else seek(0.1 + ((index + 0.65) / STAGES.length) * 0.8);
  };

  return (
    <div data-scene-step={stage}>
      {/* Mobile: tap between the stages. */}
      <div className="lg:hidden">
        <div className="flex gap-0 border" style={{ borderColor: LINE }}>
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setStage(i);
              }}
              aria-pressed={stage === i}
              className="min-h-11 min-w-0 flex-1 border-r py-2.5 text-[12px] font-medium transition-colors last:border-r-0"
              style={{
                borderColor: LINE,
                background: stage === i ? BLUE : PAPER,
                color: stage === i ? '#fff' : MUTED,
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <EngineCanvas stage={stage} />
        </div>
        <StageCopy stage={stage} className="mt-6" />
      </div>

      {/* Desktop: the panel pins, scrolling moves the stage. */}
      <div className="hidden lg:block">
        <div className="grid gap-6 lg:grid-cols-[112px_minmax(0,1fr)_minmax(0,1.5fr)] xl:gap-8">
          <nav>
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-pressed={stage === i}
                className="flex w-full items-center gap-3 border-l-2 py-2.5 pl-3.5 text-left transition-colors duration-300"
                style={{
                  borderColor: stage === i ? BLUE : LINE,
                  color: stage === i ? INK : FAINT,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 11 }}>0{i + 1}</span>
                <span className="text-[14px]" style={{ fontWeight: stage === i ? 600 : 400 }}>
                  {s.name}
                </span>
              </button>
            ))}
          </nav>

          {/* One block of words at a time, level with the canvas. */}
          <SceneViewport progress={position === null ? null : position - stage}>
            <StageCopy stage={stage} />
          </SceneViewport>

          <div data-engine-panel className="min-w-0">
            <EngineCanvas stage={stage} progress={position === null ? null : position - stage} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StageCopy({ stage, className = '' }: { stage: number; className?: string }) {
  const s = STAGES[stage];
  return (
    <div className={className} key={s.id}>
      <div className="care-fade">
        <Mono colour={BLUE}>Stage 0{stage + 1}</Mono>
        <p className="mt-4 max-w-[380px] text-[22px] font-normal leading-[1.25] tracking-[-.03em]" style={{ color: INK }}>
          {s.lead}
        </p>
        <p className="mt-4 max-w-[380px] text-[13.5px] leading-[1.7]" style={{ color: BODY }}>
          {s.body}
        </p>
        <p className="mt-5 max-w-[380px] border-l pl-4 text-[12.5px] leading-[1.6]" style={{ borderColor: BLUE_SOFT, color: MUTED }}>
          {s.foot}
        </p>
        {s.id === 'deliver' ? (
          <div className="mt-5 grid max-w-[380px] grid-cols-5 gap-2" aria-label="Delivery channels">
            {CHANNELS.map((channel) => (
              <div key={channel.id} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                <span className="grid h-8 w-8 place-items-center border" style={{ borderColor: BLUE_SOFT, color: BLUE, background: BLUE_WASH }}>
                  <ChannelIcon channel={channel.id} />
                </span>
                <span className="text-[9px] leading-tight" style={{ color: MUTED }}>
                  {channel.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* The record stays, the panel beneath it changes. */
function EngineCanvas({ stage, progress = null }: { stage: number; progress?: number | null }) {
  const stageId = STAGES[stage].id;
  const height = useSceneHeight();
  const compact = height !== null && height < 640;
  const { ref, inView } = useInView<HTMLDivElement>(0.08, false);
  const reduced = useReducedMotion();
  const [timedFilled, setFilled] = useState(0);
  const [timedThreadLen, setThreadLen] = useState(0);
  const filled = progress === null ? timedFilled : stage > 0 ? SOURCES.length : Math.min(SOURCES.length, Math.floor(progress * (SOURCES.length + 1)));
  const threadLen = progress === null ? timedThreadLen : Math.min(MONTH4.thread.length, 1 + Math.floor(progress * MONTH4.thread.length));

  // Read: the record completes one source at a time.
  useEffect(() => {
    if (progress !== null) return;
    if (stage !== 0) {
      setFilled(SOURCES.length);
      return;
    }
    if (!inView || reduced) {
      setFilled(reduced ? SOURCES.length : 0);
      return;
    }
    setFilled(0);
    const timers = SOURCES.map((_, i) => setTimeout(() => setFilled(i + 1), 300 + i * 300));
    return () => timers.forEach(clearTimeout);
  }, [stage, inView, reduced, progress]);

  // Deliver: messages arrive in order.
  useEffect(() => {
    if (progress !== null) return;
    if (stageId !== 'deliver') {
      setThreadLen(0);
      return;
    }
    if (reduced) {
      setThreadLen(MONTH4.thread.length);
      return;
    }
    const timers = MONTH4.thread.map((_, i) => setTimeout(() => setThreadLen(i + 1), 250 + i * 750));
    return () => timers.forEach(clearTimeout);
  }, [stageId, reduced, progress]);

  return (
    <div ref={ref} className="flex flex-col overflow-hidden border bg-white" style={{ borderColor: LINE, height: height ?? undefined }}>
      <div className="flex flex-none items-center justify-between border-b px-5 py-3" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
        <Mono size={10} colour={BODY}>
          {compact ? 'Linda, 51 · Month 4' : `${PROVIDER} · patient record`}
        </Mono>
        <Mono size={10} colour={BLUE}>
          {STAGES[stage].name}
        </Mono>
      </div>

      {/* Keep the patient and panel headers still while the chapter changes. */}
      {!compact ? (
        <div className="flex flex-none items-center gap-3 border-b px-5 py-4" style={{ borderColor: LINE_SOFT }}>
          <Avatar initials="LH" size={32} active />
          <div>
            <p className="text-[14.5px] font-semibold leading-none" style={{ color: INK }}>
              Linda, 51
            </p>
            <Mono size={10} colour={MUTED} className="mt-2">
              Month 4 · tirzepatide 7.5 mg
            </Mono>
          </div>
        </div>
      ) : null}

      <SceneViewport progress={progress} className="flex-1">
        {/* Delivery has its own progress chart in the message attachment. */}
        {stageId !== 'deliver' ? (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4">
              {FIELDS.map((f) => {
                const on = filled >= f.at;
                return (
                  <div key={f.label} className="border-l pl-3 transition-colors duration-500" style={{ borderColor: on ? BLUE : LINE_SOFT }}>
                    <Mono size={9} colour={on ? MUTED : FAINT}>
                      {f.label}
                    </Mono>
                    <p
                      className="mt-2 text-[12.5px] font-semibold leading-none tabular-nums transition-all duration-500"
                      style={{ color: on ? INK : FAINT, opacity: on ? 1 : 0.4 }}
                    >
                      {on ? f.value : '—'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border py-1" style={{ borderColor: LINE_SOFT, background: '#FCFDFE' }}>
              <WeightChart
                upToWeek={filled >= 3 ? 16 : 0}
                domainWeeks={16}
                highlightWeek={stage >= 1 ? 16 : undefined}
                className="h-[132px]"
              />
            </div>
          </div>
        ) : null}

        {/* The chapter. Only one is ever mounted, so nothing can overlap. */}
        <div className={`${stageId === 'deliver' ? '' : 'border-t '}p-5`} style={{ borderColor: LINE_SOFT, minHeight: 200 }}>
          <div key={stage} className="care-fade">
            {stageId === 'read' ? <ReadPanel filled={filled} /> : null}
            {stageId === 'analyse' ? <AnalysePanel /> : null}
            {stageId === 'detect' ? <DetectPanel /> : null}
            {stageId === 'decide' ? <DecidePanel /> : null}
            {stageId === 'deliver' ? <DeliverPanel threadLen={threadLen} compact={compact} /> : null}
          </div>
        </div>
      </SceneViewport>
    </div>
  );
}

function ReadPanel({ filled }: { filled: number }) {
  return (
    <div>
      <Mono size={10}>What we can read</Mono>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {SOURCES.map((s, i) => {
          const on = i < filled;
          return (
            <li
              key={s.label}
              className="flex items-center gap-3 border px-3 py-2.5 transition-all duration-400"
              style={{
                borderColor: on ? BLUE_SOFT : LINE_SOFT,
                background: on ? BLUE_WASH : PAPER,
                opacity: on ? 1 : 0.45,
              }}
            >
              <span
                className="h-1.5 w-1.5 flex-none transition-colors duration-400"
                style={{ background: on ? BLUE : LINE }}
              />
              <span className="min-w-0">
                <Mono size={9} colour={on ? BLUE : FAINT}>
                  {s.label}
                </Mono>
                <span className="mt-1.5 block truncate text-[11.5px] leading-none" style={{ color: on ? INK : FAINT }}>
                  {s.value}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11.5px] leading-[1.5]" style={{ color: FAINT }}>
        Six sources here. A provider with fewer gets a thinner record, and Lina says so.
      </p>
    </div>
  );
}

function AnalysePanel() {
  return (
    <div>
      <Mono size={10}>How the AI reaches an observation</Mono>
      <div className="mt-4 border" style={{ borderColor: BLUE_SOFT }}>
        <div className="px-3 py-3" style={{ background: BLUE_WASH }}>
          <Mono size={9} colour={BLUE}>Source records · 2 body scans</Mono>
          <p className="mt-2 text-[12px] leading-[1.5]" style={{ color: INK }}>
            {MONTH4.signal.evidence}
          </p>
        </div>
        <div className="border-t px-3 py-3" style={{ borderColor: BLUE_SOFT }}>
          <Mono size={9} colour={BLUE}>Observation · linked to the evidence</Mono>
          <p className="mt-2 text-[12px] leading-[1.5]" style={{ color: INK }}>
            {MONTH4.signal.because}
          </p>
        </div>
      </div>
      <div className="mt-4 border-l pl-3" style={{ borderColor: BLUE }}>
        <Mono size={9} colour={BLUE}>Clinical review stays with your team</Mono>
        <p className="mt-2 text-[11.5px] leading-[1.5]" style={{ color: BODY }}>
          These scans show what changed, not why. A pharmacist or prescriber reviews any clinical interpretation or treatment decision.
        </p>
      </div>
    </div>
  );
}

function DetectPanel() {
  return (
    <div>
      <Mono size={10}>What stood out this week</Mono>
      <div className="mt-4">
        <SignalCard {...MONTH4.signal} />
      </div>
      <p className="mt-4 text-[11.5px] leading-[1.5]" style={{ color: FAINT }}>
        Three other things changed on her record. None of them needs a message this week.
      </p>
    </div>
  );
}

function DecidePanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,190px)]">
      <div>
        <Mono size={10}>Prepared, not sent</Mono>
        {/* The card already carries the approval chip, so it is not repeated. */}
        <div className="mt-4">
          <ActionCard {...MONTH4.action} />
        </div>
      </div>
      <div className="self-start border" style={{ borderColor: LINE_SOFT }}>
        <VideoThumb label="Your 4-month review · 40s" />
      </div>
    </div>
  );
}

function DeliverPanel({ threadLen, compact }: { threadLen: number; compact: boolean }) {
  const complete = threadLen >= MONTH4.thread.length;
  return (
    <div>
      <Thread messages={MONTH4.thread} visible={threadLen} week={MONTH4.week} scenes={MONTH4.video?.scenes} compactAttachment={compact} attachmentClassName="max-w-[240px]" />
      {/* Reserve the confirmation's space before it fades in. */}
      <div aria-hidden={!complete} className="mt-4 border-l pl-4 transition-opacity duration-300 motion-reduce:transition-none" style={{ borderColor: BLUE, opacity: complete ? 1 : 0 }}>
        <Mono size={9} colour={BLUE}>
          Back on the record
        </Mono>
        <p className="mt-1.5 text-[11.5px] leading-[1.5]" style={{ color: BODY }}>
          Review viewed, booking requested. The month-6 message will know that happened.
        </p>
      </div>
    </div>
  );
}
