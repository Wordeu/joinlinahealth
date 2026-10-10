'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BLUE, BODY, INK, Mono } from './ui';

const TOP = 82; // 58px navigation + 24px breathing room.
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const SceneHeight = createContext<number | null>(null);

export const useSceneHeight = () => useContext(SceneHeight);

export type SceneState = {
  progress: number | null;
  seek: (progress: number) => void;
};

/** The first and last 10% of the pinned travel hold the opening/final frame. */
export function sceneProgress(progress: number) {
  return clamp((progress - 0.1) / 0.8);
}

/** Reveal tall content within its own column, without resizing any typography. */
export function SceneViewport({ progress, children, className = '' }: { progress: number | null; children: React.ReactNode; className?: string }) {
  const height = useContext(SceneHeight);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const outer = viewport.current;
    const inner = content.current;
    if (!outer || !inner) return;
    const update = () => {
      // Hold the top and bottom briefly, with page scrolling revealing the rest.
      const position = progress === null ? 0 : clamp((progress - 0.15) / 0.7);
      outer.scrollTop = height === null ? 0 : Math.max(0, outer.scrollHeight - outer.clientHeight) * position;
    };
    const observer = new ResizeObserver(update);
    observer.observe(inner);
    observer.observe(outer);
    update();
    return () => observer.disconnect();
  }, [height, progress]);

  return (
    <div ref={viewport} data-scene-viewport className={`min-h-0 min-w-0 ${className}`} style={{ maxHeight: height ?? undefined, overflow: height === null ? undefined : 'hidden', overflowAnchor: 'none' }}>
      <div ref={content} className="flow-root">{children}</div>
    </div>
  );
}

/** Keep controls usable; resume the story when the visitor scrolls again. */
export function useSceneValue<T>(progress: number | null, automatic: T, initial: T) {
  const [choice, setChoice] = useState<{ at: number | null; value: T } | null>(null);
  const manual = choice && (progress === null || (choice.at !== null && Math.abs(progress - choice.at) < 0.01));
  const value = manual ? choice.value : progress === null ? initial : automatic;
  const select = useCallback((next: T) => {
    setChoice({ at: progress, value: next });
  }, [progress]);
  return [value, select] as const;
}

export function useSceneStep(progress: number | null, count: number, initial = 0) {
  const step = progress === null ? initial : Math.min(count - 1, Math.floor(sceneProgress(progress) * count));
  return useSceneValue(progress, step, initial);
}

export default function ScrollScene({
  name, beats, index, title, description, children, steps = 1, panels = false, pin = true,
}: {
  name: string;
  beats: number;
  index?: string;
  title?: string;
  description?: string;
  steps?: number;
  panels?: boolean;
  pin?: boolean;
  children: (state: SceneState) => React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const metrics = useRef({ enabled: false, height: 0, bodyHeight: 0, travel: 0 });
  const [layout, setLayout] = useState(metrics.current);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const outer = track.current;
    const inner = content.current;
    if (!outer || !inner || !pin) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let consent: Element | null = null;

    const updateProgress = () => {
      frame = 0;
      if (!metrics.current.enabled) return;
      setProgress(clamp((TOP - outer.getBoundingClientRect().top) / metrics.current.travel));
    };
    const measure = () => {
      const enabled = desktop.matches && !reduced.matches && window.innerHeight > 420;
      const bottomInset = consent?.getBoundingClientRect().height ?? 0;
      const available = Math.max(1, window.innerHeight - TOP - bottomInset - 24);
      const next = {
        enabled,
        // Reserve one stable viewport frame even when a later scene is taller.
        height: available,
        bodyHeight: Math.max(1, available - (heading.current?.offsetHeight ?? 0)),
        travel: enabled ? beats * Math.max(240, window.innerHeight * 0.45) : 0,
      };
      metrics.current = next;
      setLayout((current) => Object.keys(next).every((key) => current[key as keyof typeof next] === next[key as keyof typeof next]) ? current : next);
      updateProgress();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    if (heading.current) observer.observe(heading.current);
    // Keep the full scene above the optional fixed consent banner, including
    // when it is expanded or dismissed after this section has mounted.
    const syncConsent = () => {
      const next = document.querySelector('aside[aria-label="Cookie consent"]');
      if (next === consent) return;
      if (consent) observer.unobserve(consent);
      consent = next;
      if (consent) observer.observe(consent);
      measure();
    };
    const mutations = new MutationObserver(syncConsent);
    mutations.observe(document.body, { childList: true, subtree: true });
    syncConsent();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    desktop.addEventListener('change', measure);
    reduced.addEventListener('change', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      desktop.removeEventListener('change', measure);
      reduced.removeEventListener('change', measure);
    };
  }, [beats, pin]);

  const seek = useCallback((value: number) => {
    if (!pin || !track.current || !metrics.current.enabled) return;
    window.scrollTo({
      top: track.current.getBoundingClientRect().top + window.scrollY - TOP + clamp(value) * metrics.current.travel,
      behavior: 'smooth',
    });
  }, [pin]);

  const enabled = pin && layout.enabled;
  const fittedHeight = layout.height;
  const position = sceneProgress(progress) * steps;
  const phase = Math.min(1, position - Math.min(steps - 1, Math.floor(position)));
  const body = children({ progress: enabled ? progress : null, seek });
  return (
    <div ref={track} data-scroll-scene={name} data-pinned={enabled} style={{ height: enabled ? fittedHeight + layout.travel : undefined }}>
      <div data-scene-pin style={{ position: enabled ? 'sticky' : 'relative', top: enabled ? TOP : undefined, height: enabled ? fittedHeight : undefined }}>
        <div ref={content} data-scene-content className="flow-root">
          {title ? (
            <div ref={heading} className="flow-root pb-8">
              {index ? <Mono colour={BLUE}>{index}</Mono> : null}
              <h2 className="mt-2 max-w-[780px] text-[22px] font-normal leading-[1.23] tracking-[-.025em] sm:text-[30px]" style={{ color: INK }}>{title}</h2>
              {description ? <p className="mt-5 max-w-[640px] text-[14px] leading-[1.7]" style={{ color: BODY }}>{description}</p> : null}
            </div>
          ) : null}
          <SceneHeight.Provider value={enabled ? layout.bodyHeight : null}>
            {panels ? body : <SceneViewport progress={enabled ? phase : null}>{body}</SceneViewport>}
          </SceneHeight.Provider>
        </div>
      </div>
    </div>
  );
}
