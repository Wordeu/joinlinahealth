'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollScene, { SceneViewport, sceneProgress, useSceneHeight, useSceneValue } from './ScrollScene';
import {
  BLUE,
  BLUE_SOFT,
  BODY,
  CANVAS,
  FAINT,
  INK,
  LINE,
  LINE_SOFT,
  MUTED,
  Mono,
  PAPER,
  Seg,
  useReducedMotion,
} from './ui';

/* Same four events in both states. With Lina each one lines up against a
   response; without it they sit unanswered under the line. */
const EVENTS = [
  { at: 16, week: 'Week 1', patient: 'Treatment begins', response: 'Starting-out guidance', note: 'What the first fortnight looks like' },
  { at: 38, week: 'Week 2', patient: 'Nausea reported', response: 'Check-in, pharmacist if needed', note: 'Routine guidance now, a human if it persists' },
  { at: 60, week: 'Week 3', patient: 'Unsure it is working', response: 'Short progress video', note: 'Her own numbers, not an average' },
  { at: 82, week: 'Week 4', patient: 'Refill due', response: 'Timely reminder and support', note: 'Before she drops off, not after' },
];

const EASE = 'cubic-bezier(.22,.61,.36,1)';

export default function CareGap() {
  return (
    <ScrollScene name="care-gap" beats={4} index="002" title="Typically, you lose patients to price between prescriptions because you’re out of touch."
      description="Lina helps your team see side effects, stalled progress, and missed refills early, so you can act before a patient drops off." panels>
      {({ progress }) => <GapSequence progress={progress} />}
    </ScrollScene>
  );
}

function GapSequence({ progress }: { progress: number | null }) {
  const reduced = useReducedMotion();
  const height = useSceneHeight();
  const compact = height !== null && height < 530;
  const track = useRef<HTMLDivElement | null>(null);
  const [fallbackRevealed, setRevealed] = useState(0);
  const automatic = progress === null ? fallbackRevealed : Math.min(EVENTS.length, Math.floor(sceneProgress(progress) * (EVENTS.length + 1)));
  const [revealed, selectRevealed] = useSceneValue(progress, automatic, fallbackRevealed);

  /* Scroll position reveals the responses, one per fifth of the travel. The
     reader sets the pace and cannot arrive after the transformation is over. */
  useEffect(() => {
    if (progress !== null) return;
    if (reduced) {
      setRevealed(EVENTS.length);
      return;
    }
    const onScroll = () => {
      const el = track.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;
      const vh = window.innerHeight;
      const from = vh * 0.72; // nothing revealed until the timeline is properly up
      const run = vh * 0.46;
      const p = Math.min(1, Math.max(0, (from - rect.top) / run));
      setRevealed(Math.min(EVENTS.length, Math.floor(p * (EVENTS.length + 1))));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced, progress]);

  const setMode = (next: 'without' | 'with') => {
    selectRevealed(next === 'with' ? EVENTS.length : 0);
  };

  const all = revealed >= EVENTS.length;
  const lineWidth = revealed === 0 ? 0 : all ? 100 : EVENTS[revealed - 1].at + 3;

  return (
    <div data-scene-step={revealed} className="flex min-h-0 flex-col" style={{ height: height ?? undefined }}>
      <div className="flex flex-none flex-wrap items-center justify-between gap-4">
        {/* The toggle is the manual way in. Scrolling is the default one. */}
        <Seg
          label="Compare care between prescriptions"
          value={revealed > 0 ? 'with' : 'without'}
          onChange={setMode}
          options={[
            { value: 'without', label: 'Without Lina' },
            { value: 'with', label: 'With Lina' },
          ]}
          activeValueTone={(value) => value === 'with' ? 'blue' : 'neutral'}
        />
        <Mono size={11} colour={FAINT}>
          One timeline · 28 days between prescriptions
        </Mono>
      </div>

      {/* Only the timeline pans; its comparison controls stay in place. */}
      <SceneViewport progress={progress === null ? null : sceneProgress(progress)} className="mt-6 flex-1">
      <div ref={track} className="relative">
        <div>
          <div className="border" style={{ borderColor: LINE, background: CANVAS }}>
            <div className="p-4 sm:hidden" aria-label="Care timeline">
              <Mono size={10} colour={INK}>Prescription issued</Mono>
              <ol className="my-5 space-y-4 border-l pl-4" style={{ borderColor: LINE }}>
                {EVENTS.map((event, i) => {
                  const on = i < revealed;
                  return (
                    <li key={event.week} className="relative border bg-white p-4" style={{ borderColor: on ? BLUE_SOFT : LINE }}>
                      <span className="absolute -left-[21px] top-5 h-2 w-2" style={{ background: on ? BLUE : MUTED }} aria-hidden="true" />
                      <Mono size={10} colour={MUTED}>{event.week}</Mono>
                      <p className="mt-2 text-[14px] font-medium" style={{ color: INK }}>{event.patient}</p>
                      {on ? (
                        <div className="mt-3 border-t pt-3" style={{ borderColor: BLUE_SOFT }}>
                          <Mono size={10} colour={BLUE}>Lina</Mono>
                          <p className="mt-2 text-[13px] font-medium leading-relaxed" style={{ color: INK }}>{event.response}</p>
                          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>{event.note}</p>
                        </div>
                      ) : <p className="mt-2 text-[12px] leading-relaxed" style={{ color: MUTED }}>Nothing goes out between the two prescriptions</p>}
                    </li>
                  );
                })}
              </ol>
              <Mono size={10} colour={INK}>Next prescription</Mono>
            </div>
            {/* Narrow screens pan the timeline rather than squashing four weeks into 320px. */}
            <div className="hidden overflow-x-auto sm:block" tabIndex={0} role="region" aria-label="Care timeline, scroll horizontally to see all four weeks">
              <div className={`min-w-[880px] px-8 sm:px-10 ${compact ? 'py-2' : 'py-10'}`}>
            {/* Lina's responses sit above the line. */}
            <div className={`relative ${compact ? 'h-[112px]' : 'h-[168px]'}`}>
              <div
                className="absolute inset-x-0 bottom-7 flex items-center justify-center border border-dashed py-7"
                style={{
                  borderColor: LINE,
                  opacity: revealed === 0 ? 1 : 0,
                  transition: reduced ? 'none' : `opacity .4s ${EASE}`,
                }}
              >
                <Mono size={11} colour={FAINT}>
                  Nothing goes out between the two prescriptions
                </Mono>
              </div>

              {EVENTS.map((e, i) => {
                const on = i < revealed;
                return (
                  <div
                    key={e.week}
                    className="absolute w-[168px] -translate-x-1/2"
                    style={{
                      left: `${e.at}%`,
                      bottom: 0,
                      opacity: on ? 1 : 0,
                      transform: `translateX(-50%) translateY(${on ? 0 : 12}px)`,
                      transition: reduced ? 'none' : `opacity .5s ${EASE}, transform .5s ${EASE}`,
                    }}
                  >
                    {/* Fixed height so four cards of different length line up. */}
                    <div
                      className={`flex flex-col justify-center bg-white ${compact ? 'h-[96px] p-2.5' : 'h-[128px] p-4'}`}
                      style={{ border: `1px solid ${BLUE_SOFT}`, borderBottom: `2px solid ${BLUE}` }}
                    >
                      {!compact ? <Mono size={10} colour={BLUE}>
                        Lina
                      </Mono> : null}
                      <p className={`${compact ? '' : 'mt-2.5 '}text-[13px] font-semibold leading-[1.35]`} style={{ color: INK }}>
                        {e.response}
                      </p>
                      <p className={`${compact ? 'mt-1' : 'mt-2'} text-[11.5px] leading-[1.45]`} style={{ color: MUTED }}>
                        {e.note}
                      </p>
                    </div>
                    <div className={`mx-auto w-px ${compact ? 'h-4' : 'h-7'}`} style={{ background: BLUE_SOFT }} />
                  </div>
                );
              })}
            </div>

            {/* The line, with the two prescriptions pinned to the ends. */}
            <div className="relative h-[2px]" style={{ background: LINE }}>
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  background: BLUE,
                  width: `${lineWidth}%`,
                  transition: reduced ? 'none' : `width .6s ${EASE}`,
                }}
              />
              {[0, 100].map((pos, i) => (
                <div key={pos} className="absolute -translate-x-1/2" style={{ left: `${pos}%`, top: -7 }}>
                  <span className="block h-4 w-4 border-2 bg-white" style={{ borderColor: INK }} />
                  <span
                    className="absolute top-7 block w-[140px] whitespace-nowrap"
                    style={i === 0 ? { left: -8, textAlign: 'left' } : { right: -8, textAlign: 'right' }}
                  >
                    <Mono size={11} colour={INK}>
                      {i === 0 ? 'Prescription issued' : 'Next prescription'}
                    </Mono>
                  </span>
                </div>
              ))}
              {EVENTS.map((e, i) => (
                <span
                  key={e.week}
                  className="absolute h-[10px] w-[10px] -translate-x-1/2"
                  style={{
                    left: `${e.at}%`,
                    top: -4,
                    background: i < revealed ? BLUE : '#C9CFD6',
                    transition: reduced ? 'none' : `background .4s ${EASE}`,
                  }}
                />
              ))}
            </div>

            {/* What the patient experiences. The same four, in both states. */}
            <div className={`relative ${compact ? 'mt-8 h-16' : 'mt-16 h-[86px]'}`}>
              {EVENTS.map((e, i) => {
                const on = i < revealed;
                return (
                  <div key={e.week} className="absolute w-[168px] -translate-x-1/2" style={{ left: `${e.at}%`, top: 0 }}>
                    <div
                      className={`bg-white ${compact ? 'p-2.5' : 'p-4'}`}
                      style={{
                        border: `1px solid ${on ? LINE : LINE_SOFT}`,
                        opacity: on ? 1 : 0.6,
                        transition: reduced ? 'none' : `opacity .5s ${EASE}, border-color .5s ${EASE}`,
                      }}
                    >
                      <Mono size={10} colour={on ? BODY : FAINT}>
                        {e.week}
                      </Mono>
                      <p className="mt-2.5 text-[13px] leading-[1.35]" style={{ color: on ? INK : MUTED }}>
                        {e.patient}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t px-8 py-4 sm:px-10"
              style={{ borderColor: LINE_SOFT, background: PAPER }}
            >
              <Mono size={11} colour={revealed > 0 ? BLUE : FAINT}>
                {revealed} of {EVENTS.length} events answered
              </Mono>
              <p className="text-[12.5px]" style={{ color: BODY }}>
                {revealed === 0
                  ? 'The events still happen. Nobody at the pharmacy sees them until she calls, or stops reordering.'
                  : all
                    ? 'Same four events. Each one now has something attached to it.'
                    : 'Keep scrolling. Lina answers them as they happen.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      </SceneViewport>
    </div>
  );
}
