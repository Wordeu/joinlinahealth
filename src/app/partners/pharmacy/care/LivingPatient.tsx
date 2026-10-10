'use client';

import { SceneViewport, sceneProgress, useSceneHeight, useSceneStep } from './ScrollScene';
import {
  Avatar,
  BLUE,
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
  useReducedMotion,
  useTween,
} from './ui';
import { WeightChart } from './charts';
import { ActionCard, Field, SignalCard, Thread, VideoPlayer } from './atoms';
import { LINDA_MOMENTS, LINDA_WEIGHT } from './data';

const MAX_WEEK = 24;

export default function LivingPatient({ progress = null }: { progress?: number | null }) {
  const [index, setIndex] = useSceneStep(progress, LINDA_MOMENTS.length, 3);
  const height = useSceneHeight();
  const position = progress === null ? null : sceneProgress(progress) * LINDA_MOMENTS.length;
  const phase = position === null ? null : position - Math.min(LINDA_MOMENTS.length - 1, Math.floor(position));
  const moment = LINDA_MOMENTS[index];
  const reduced = useReducedMotion();
  const delta = useTween(moment.weightKg - LINDA_WEIGHT[0].kg, reduced ? 0 : 650, 1);
  const showComposition = Boolean(moment.composition);

  return (
    <div data-scene-step={index}>
      <div className="flex flex-col border bg-white" style={{ borderColor: LINE, maxHeight: height === null ? undefined : height - 32 }}>
        <div className="flex flex-none flex-wrap items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <div className="flex items-center gap-2.5">
            <Avatar initials="LH" size={26} active />
            <div>
              <p className="text-[12.5px] font-semibold leading-none" style={{ color: INK }}>
                Linda Hartley, 51
              </p>
              <Mono size={9} colour={MUTED} className="mt-1.5">
                {moment.stage}
              </Mono>
            </div>
          </div>
          <Chip tone={moment.signal.tone}>{moment.long}</Chip>
        </div>

        <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,.85fr)] lg:grid-rows-[minmax(0,1fr)]">
          {/* Left: the record */}
          <SceneViewport progress={phase}>
          <div className="border-b p-3 lg:border-b-0 lg:border-r lg:p-4" style={{ borderColor: LINE_SOFT }}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <Mono size={9}>Weight change</Mono>
                <p className="mt-2 text-[34px] font-bold leading-none tabular-nums tracking-[-.04em]" style={{ color: INK }}>
                  {delta.toFixed(1)}
                  <span className="text-[15px] font-semibold"> kg</span>
                </p>
                <p className="mt-1.5 text-[12px] font-medium" style={{ color: BLUE }}>
                  {LINDA_WEIGHT[0].kg} kg → {moment.weightKg.toFixed(1)} kg
                </p>
              </div>
              {showComposition ? (
                <div className="pb-1 text-right">
                  <Mono size={9}>Measured split</Mono>
                  <p className="mt-2 text-[12.5px] font-semibold leading-tight tabular-nums" style={{ color: INK }}>
                    {moment.composition!.fatDelta.toFixed(1)} kg fat
                  </p>
                  <p className="text-[12.5px] font-semibold leading-tight tabular-nums" style={{ color: MUTED }}>
                    {moment.composition!.leanDelta.toFixed(1)} kg lean
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-3 border" style={{ borderColor: LINE_SOFT, background: '#FCFDFE' }}>
              <div className="flex items-center justify-between border-b px-2.5 py-1.5" style={{ borderColor: LINE_SOFT }}>
                <Mono size={8}>Weight · kg</Mono>
                <Mono size={8} colour={FAINT}>
                  Every weigh-in
                </Mono>
              </div>
              <WeightChart upToWeek={moment.week} highlightWeek={moment.week} className="h-[150px]" />
            </div>

            {/* The scan is drawn once, in the film she actually watches. Here it
                is a number in her record, which is all the pharmacy needs. */}

            {/* Three across, one row. The scan date a fourth would carry is
                already in the signal underneath. */}
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {moment.measurements.slice(0, 3).map((m) => (
                <Field key={m.label} label={m.label} value={m.value} note={m.note} />
              ))}
            </div>

            <div className="mt-3">
              <SignalCard {...moment.signal} compact />
            </div>
          </div>
          </SceneViewport>

          {/* Centre: the film she actually receives */}
          <SceneViewport progress={phase}>
          <div className="border-b p-3 lg:border-b-0 lg:border-r lg:p-4" style={{ borderColor: LINE_SOFT }}>
            <VideoPlayer moment={moment} autoPlay={false} />
            <div className="mt-3">
              <ActionCard {...moment.action} compact />
            </div>
          </div>
          </SceneViewport>

          {/* Right: how it reaches her */}
          <SceneViewport progress={phase}>
          <div className="flex flex-col p-3 lg:p-4">
            <div className="min-h-[278px] flex-1">
              <Thread messages={moment.thread} week={moment.week} scenes={moment.video?.scenes} className="h-full" />
            </div>
            <div className="mt-3 flex-none border-l pl-2.5" style={{ borderColor: BLUE }}>
              <Mono size={8} colour={BLUE}>
                Next
              </Mono>
              <p className="mt-1.5 text-[11.5px] leading-[1.5]" style={{ color: BODY }}>
                {moment.next}
              </p>
            </div>
          </div>
          </SceneViewport>
        </div>

        {/* The one controller for everything above. */}
        <div className="flex-none border-t px-3 pb-4 pt-3.5 sm:px-5" style={{ borderColor: LINE_SOFT, background: CANVAS }}>
          <div className="flex items-center justify-between">
            <Mono size={9}>Treatment timeline</Mono>
            <Mono size={9} colour={FAINT}>
              Tap a moment
            </Mono>
          </div>

          <div className="relative mt-4" role="radiogroup" aria-label="Treatment moment">
            <div className="absolute left-0 right-0 top-[7px] h-[2px]" style={{ background: LINE }} />
            <div
              className="absolute left-0 top-[7px] h-[2px]"
              style={{
                background: BLUE,
                width: `${(moment.week / MAX_WEEK) * 100}%`,
                transition: reduced ? 'none' : 'width .5s cubic-bezier(.22,.61,.36,1)',
              }}
            />
            <div className="relative flex justify-between">
              {LINDA_MOMENTS.map((m, i) => {
                const on = i === index;
                const passed = i <= index;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setIndex(i)}
                    className="group flex min-h-11 min-w-0 flex-1 flex-col items-center gap-2.5 px-0.5"
                  >
                    <span
                      className="h-4 w-4 border-2 transition-all duration-300"
                      style={{
                        background: passed ? BLUE : PAPER,
                        borderColor: passed ? BLUE : '#C9CFD6',
                        transform: on ? 'scale(1.12)' : 'scale(1)',
                        boxShadow: on ? `0 0 0 4px ${BLUE_WASH}` : 'none',
                      }}
                    />
                    <span className="text-center">
                      <span
                        className="block text-[11px] font-semibold leading-none transition-colors"
                        style={{ color: on ? INK : MUTED }}
                      >
                        {m.short}
                      </span>
                      <span
                        className="mt-1 hidden text-[9.5px] leading-tight sm:block"
                        style={{ color: on ? BLUE : FAINT, fontFamily: MONO, letterSpacing: '.04em' }}
                      >
                        {m.long}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11.5px]" style={{ color: FAINT }}>
        Linda is not a real patient. Her records, measurements and messages are the same ones used everywhere else on this page.
      </p>
    </div>
  );
}
