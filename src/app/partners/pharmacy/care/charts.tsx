'use client';

import { useId, useMemo } from 'react';
import {
  BLUE,
  BLUE_DEEP,
  BLUE_MID,
  BLUE_SOFT,
  BLUE_WASH,
  BODY,
  FAINT,
  INK,
  LINE,
  LINE_SOFT,
  MONO,
  MUTED,
  useReducedMotion,
  useTween,
} from './ui';
import { LINDA_COMPOSITION, LINDA_WEIGHT, type WeightPoint } from './data';

/* Every chart on the page shares these axes, so a line drawn in the hero and
   the same line drawn inside the video sit at the same height. */

const W = 520;
const H = 180;
const PAD = { top: 16, right: 18, bottom: 26, left: 38 };
const MAX_WEEK = 24;
const Y_MIN = 80;
const Y_MAX = 96;

const xAt = (week: number, domain: number) => PAD.left + (week / domain) * (W - PAD.left - PAD.right);
const y = (kg: number) => PAD.top + ((Y_MAX - kg) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom);

export function WeightChart({
  upToWeek = MAX_WEEK,
  domainWeeks = MAX_WEEK,
  highlightWeek,
  points = LINDA_WEIGHT,
  showAxis = true,
  compact = false,
  tone = BLUE,
  className = '',
}: {
  upToWeek?: number;
  /** How much of the six months the x axis covers. The y axis never changes. */
  domainWeeks?: number;
  highlightWeek?: number;
  points?: WeightPoint[];
  showAxis?: boolean;
  compact?: boolean;
  tone?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  // A single-point chart still needs an axis to sit on.
  const domain = Math.max(4, domainWeeks);
  const px = (week: number) => xAt(week, domain);
  const shown = useMemo(() => {
    const kept = points.filter((p) => p.week <= domainWeeks);
    return kept.length > 0 ? kept : points.slice(0, 1);
  }, [points, domainWeeks]);
  const clipW = useTween(px(Math.min(upToWeek, domain)) + 6, reduced ? 0 : 820, 2);
  const path = useMemo(
    () => shown.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(p.week, domain).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(' '),
    [shown, domain]
  );
  const ticks = [80, 84, 88, 92, 96];
  const step = domain <= 8 ? 2 : domain <= 16 ? 4 : 8;
  const last = shown[shown.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full ${className}`}
      role="img"
      aria-label={`Weight from ${shown[0].kg} kg to ${last.kg} kg`}
    >
      <defs>
        <clipPath id={`wc-${uid}`}>
          <rect x="0" y="0" width={clipW} height={H} />
        </clipPath>
        <linearGradient id={`wf-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity=".14" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showAxis &&
        ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={LINE_SOFT} strokeWidth="1" />
            <text x={PAD.left - 8} y={y(t) + 3} textAnchor="end" style={{ fontFamily: MONO, fontSize: 8, fill: FAINT, letterSpacing: '.06em' }}>
              {t}
            </text>
          </g>
        ))}

      {showAxis &&
        shown
          .filter((p) => p.week % step === 0)
          .map((p) => (
            <text key={p.week} x={px(p.week)} y={H - 8} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 8, fill: FAINT, letterSpacing: '.06em' }}>
              {p.label}
            </text>
          ))}

      <g clipPath={`url(#wc-${uid})`}>
        <path d={`${path} L${px(last.week)} ${H - PAD.bottom} L${px(shown[0].week)} ${H - PAD.bottom} Z`} fill={`url(#wf-${uid})`} />
        <path d={path} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {shown.map((p) => {
        const visible = px(p.week) <= clipW;
        const hot = highlightWeek === p.week;
        const r = compact ? 2.6 : 3.2;
        return (
          <g key={p.week} style={{ opacity: visible ? 1 : 0, transition: reduced ? 'none' : 'opacity .25s ease-out' }}>
            {hot && <circle cx={px(p.week)} cy={y(p.kg)} r={r + 5} fill={tone} fillOpacity=".14" />}
            <rect
              x={px(p.week) - r}
              y={y(p.kg) - r}
              width={r * 2}
              height={r * 2}
              fill={hot ? BLUE_DEEP : tone}
              stroke="#fff"
              strokeWidth="1.2"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** The month-4 moment: one block of weight separates into the measured layers.
 *  Mass has to be stacked from zero, so this chart carries its own axis and
 *  says so. Collapsed and split states share that axis, so only the bands move. */
export function CompositionChart({ split, week = 16, className = '' }: { split: boolean; week?: number; className?: string }) {
  const reduced = useReducedMotion();
  const t = useTween(split ? 1 : 0, reduced ? 0 : 700, 3);
  const scans = LINDA_COMPOSITION.filter((c) => c.week <= week);
  const CH = 196;
  const top = 18;
  const base = CH - 30;
  const MASS_MAX = 95;
  const h = (kg: number) => ((base - top) * kg) / MASS_MAX;
  const barW = 58;
  const gap = scans.length > 2 ? 56 : 96;
  const left = 74;
  const bx = (i: number) => left + i * (barW + gap);

  const label = (c: (typeof LINDA_COMPOSITION)[number]) => (c.week === 0 ? 'Baseline' : `Month ${Math.round(c.week / 4)}`);

  return (
    <svg viewBox={`0 0 ${W} ${CH}`} className={`w-full ${className}`} role="img" aria-label="Linda's weight at each scan, split into measured lean mass, fat mass and other tissue">
      {[0, 25, 50, 75].map((v) => (
        <g key={v}>
          <line x1={46} x2={W - 16} y1={base - h(v)} y2={base - h(v)} stroke={LINE_SOFT} strokeWidth="1" />
          <text x={40} y={base - h(v) + 3} textAnchor="end" style={{ fontFamily: MONO, fontSize: 8, fill: FAINT, letterSpacing: '.06em' }}>
            {v}
          </text>
        </g>
      ))}
      <text x={40} y={top - 4} textAnchor="end" style={{ fontFamily: MONO, fontSize: 7, fill: FAINT, letterSpacing: '.08em' }}>
        kg
      </text>

      {/* Change between the first and last scan, drawn against the segments it refers to. */}
      {scans.length > 1
        ? (
            [
              { key: 'lean', from: scans[0].lean / 2, to: scans[scans.length - 1].lean / 2, delta: scans[scans.length - 1].lean - scans[0].lean, colour: BLUE_DEEP },
              {
                key: 'fat',
                from: scans[0].lean + scans[0].fat / 2,
                to: scans[scans.length - 1].lean + scans[scans.length - 1].fat / 2,
                delta: scans[scans.length - 1].fat - scans[0].fat,
                colour: BLUE,
              },
            ] as const
          ).map((d) => {
            const x1 = bx(0) + barW;
            const x2 = bx(scans.length - 1);
            return (
              <g key={d.key} opacity={t}>
                <path
                  d={`M${x1} ${base - h(d.from)} L${x2} ${base - h(d.to)}`}
                  stroke={d.colour}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  fill="none"
                />
                <text
                  x={(x1 + x2) / 2}
                  y={base - h((d.from + d.to) / 2) - 6}
                  textAnchor="middle"
                  style={{ fontFamily: MONO, fontSize: 9, fill: d.colour, letterSpacing: '.04em' }}
                >
                  {d.delta.toFixed(1)}
                </text>
              </g>
            );
          })
        : null}

      {scans.map((c, i) => {
        const total = c.lean + c.fat + 3.5;
        // Collapsed, the two dividers sit at the top of the bar: one solid block.
        const leanH = h(total + (c.lean - total) * t);
        const fatH = h((c.lean + c.fat - total) * t + total) - leanH;
        const otherH = h(total) - leanH - fatH;
        const x0 = bx(i);
        return (
          <g key={c.week}>
            <rect x={x0} y={base - leanH} width={barW} height={leanH} fill={BLUE_DEEP} fillOpacity={0.25 + 0.6 * t} />
            <rect x={x0} y={base - leanH - fatH} width={barW} height={Math.max(0, fatH)} fill={BLUE} fillOpacity={0.3 + 0.55 * t} />
            <rect x={x0} y={base - leanH - fatH - otherH} width={barW} height={Math.max(0, otherH)} fill={BLUE_MID} fillOpacity={0.3 + 0.4 * t} />
            <rect x={x0} y={base - h(total)} width={barW} height={h(total)} fill="none" stroke={INK} strokeWidth="1.2" />

            <text x={x0 + barW / 2} y={base - h(total) - 7} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 9, fill: INK, letterSpacing: '.04em' }}>
              {total.toFixed(1)} kg
            </text>
            <text x={x0 + barW / 2} y={base + 14} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 8, fill: FAINT, letterSpacing: '.06em' }}>
              {label(c)}
            </text>

            {/* Only the latest scan carries value labels, so the chart stays quiet. */}
            {i === scans.length - 1 ? (
              <g opacity={t}>
                <text x={x0 + barW + 8} y={base - leanH / 2 + 3} style={{ fontFamily: MONO, fontSize: 8.5, fill: BLUE_DEEP, letterSpacing: '.04em' }}>
                  Lean {c.lean}
                </text>
                <text x={x0 + barW + 8} y={base - leanH - fatH / 2 + 3} style={{ fontFamily: MONO, fontSize: 8.5, fill: BLUE, letterSpacing: '.04em' }}>
                  Fat {c.fat}
                </text>
                <text x={x0 + barW + 8} y={base - leanH - fatH - otherH / 2 + 3} style={{ fontFamily: MONO, fontSize: 8.5, fill: MUTED, letterSpacing: '.04em' }}>
                  Other 3.5
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ── The frame inside a personalised video ──────────────────────────── */

const VW = 320;
const VH = 180;
/* Room at the top for the title band and at the bottom for the caption, so the
   line sits in the middle of the frame however wide it is drawn. */
const VPAD = { top: 40, right: 22, bottom: 48, left: 22 };

/* The reporting charts share one fixed axis so two panels can be compared. A
   video is watched on its own, so it fits the axis to the patient's own line
   and keeps headroom above it for the readout that travels with the playhead. */
function videoFrame(points: WeightPoint[], domainWeeks: number) {
  const kept = points.filter((p) => p.week <= domainWeeks);
  // A patient with one weigh-in has a starting weight and no trend. Hold that
  // number across the frame rather than borrowing a later one to make a slope.
  const flat = kept.length < 2;
  const domain = flat ? Math.max(4, domainWeeks) : Math.max(1, kept[kept.length - 1].week);
  const shown = flat ? [{ ...points[0], week: 0 }, { ...points[0], week: domain }] : kept;
  const values = shown.map((p) => p.kg);
  const range = Math.max(1, Math.max(...values) - Math.min(...values));
  const hi = Math.max(...values) + range * 0.5;
  const lo = Math.min(...values) - range * 0.15;
  return {
    shown,
    domain,
    vx: (week: number) => VPAD.left + (week / domain) * (VW - VPAD.left - VPAD.right),
    vy: (kg: number) => VPAD.top + ((hi - kg) / (hi - lo)) * (VH - VPAD.top - VPAD.bottom),
  };
}

/** The weight line as it appears inside the video Lina builds for a patient:
 *  her weigh-ins, drawn to the playhead. `reveal` is the playhead, 0 to 1. */
export function VideoLine({
  reveal,
  points = LINDA_WEIGHT,
  domainWeeks = 16,
}: {
  reveal: number;
  points?: WeightPoint[];
  domainWeeks?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const { shown, vx, vy } = useMemo(() => videoFrame(points, domainWeeks), [points, domainWeeks]);

  const t = Math.max(0, Math.min(1, reveal));
  const headWeek = shown[0].week + (shown[shown.length - 1].week - shown[0].week) * t;
  const headX = vx(headWeek);
  const headKg = weightAt(headWeek, shown);
  const base = VH - VPAD.bottom;
  const path = shown.map((p, i) => `${i === 0 ? 'M' : 'L'}${vx(p.week).toFixed(1)} ${vy(p.kg).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <clipPath id={`vl-${uid}`}>
          <rect x="0" y="0" width={headX + 0.6} height={VH} />
        </clipPath>
        <linearGradient id={`vf-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity=".16" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* A quiet rule behind the line, so the frame reads as a composed shot.
          None of them sits on the plot edge, where it would double the band. */}
      {[0.34, 0.67, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={VW}
          y1={VPAD.top + f * (VH - VPAD.top - VPAD.bottom)}
          y2={VPAD.top + f * (VH - VPAD.top - VPAD.bottom)}
          stroke={LINE_SOFT}
          strokeWidth="1"
        />
      ))}

      <g clipPath={`url(#vl-${uid})`}>
        <path d={`${path} L${vx(shown[shown.length - 1].week)} ${base} L${vx(shown[0].week)} ${base} Z`} fill={`url(#vf-${uid})`} />
        <path d={path} fill="none" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </g>

      {shown.map((p) =>
        vx(p.week) <= headX ? (
          <rect key={p.week} x={vx(p.week) - 2.2} y={vy(p.kg) - 2.2} width="4.4" height="4.4" fill={BLUE} stroke="#fff" strokeWidth="1.2" />
        ) : null
      )}

      {/* The playhead. Its readout is drawn in HTML above, so the number stays
          the same size whatever width the frame is given. */}
      <circle cx={headX} cy={vy(headKg)} r="7.5" fill={BLUE} fillOpacity=".12" />
      <circle cx={headX} cy={vy(headKg)} r="3.4" fill={BLUE_DEEP} stroke="#fff" strokeWidth="1.6" />
    </svg>
  );
}

/** Where the playhead sits in the frame, as percentages, so a caller can hang
 *  HTML on it. Keeps the readout clear of the edges. */
export function videoHead(reveal: number, points: WeightPoint[] = LINDA_WEIGHT, domainWeeks = 16) {
  const { shown, vx, vy } = videoFrame(points, domainWeeks);
  const t = Math.max(0, Math.min(1, reveal));
  const week = shown[0].week + (shown[shown.length - 1].week - shown[0].week) * t;
  const kg = weightAt(week, shown);
  const x = vx(week);
  const y = vy(kg);
  return {
    kg,
    left: `${(Math.max(42, Math.min(VW - 42, x)) / VW) * 100}%`,
    top: `${(y / VH) * 100}%`,
  };
}

/** Linear interpolation between weigh-ins, so the playhead reads a number on
 *  every frame rather than only on the days she stepped on the scales. */
export function weightAt(week: number, points: WeightPoint[] = LINDA_WEIGHT) {
  if (week <= points[0].week) return points[0].kg;
  for (let i = 1; i < points.length; i += 1) {
    if (week <= points[i].week) {
      const a = points[i - 1];
      const b = points[i];
      return a.kg + (b.kg - a.kg) * ((week - a.week) / (b.week - a.week));
    }
  }
  return points[points.length - 1].kg;
}

/* ── Small inline charts for the six data cards ─────────────────────── */

export function Sparkline({ values, colour = BLUE, height = 34 }: { values: number[]; colour?: string; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (values.length - 1)) * 96 + 2} ${30 - ((v - min) / span) * 26}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 34" style={{ height }} className="w-full" aria-hidden="true">
      <path d={d} fill="none" stroke={colour} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={96} y={30 - ((values[values.length - 1] - min) / span) * 26 - 2.2} width="4.4" height="4.4" fill={colour} />
    </svg>
  );
}

/** Two cohorts on one pair of axes. Used by the commercial section. */
export function CohortChart({
  months,
  baseline,
  supported,
  showSupported,
  className = '',
}: {
  months: number;
  baseline: number[];
  supported: number[];
  showSupported: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const cw = 520;
  const ch = 200;
  const pad = { t: 14, r: 16, b: 26, l: 36 };
  const px = (i: number) => pad.l + (i / months) * (cw - pad.l - pad.r);
  const py = (v: number) => pad.t + (1 - v) * (ch - pad.t - pad.b);
  const toPath = (series: number[]) => series.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
  const reveal = useTween(showSupported ? 1 : 0, reduced ? 0 : 750, 3);

  return (
    <svg viewBox={`0 0 ${cw} ${ch}`} className={`w-full ${className}`} role="img" aria-label="Illustrative share of patients still on treatment, with and without Lina">
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={cw - pad.r} y1={py(v)} y2={py(v)} stroke={LINE_SOFT} strokeWidth="1" />
          <text x={pad.l - 7} y={py(v) + 3} textAnchor="end" style={{ fontFamily: MONO, fontSize: 8, fill: FAINT, letterSpacing: '.06em' }}>
            {Math.round(v * 100)}
          </text>
        </g>
      ))}
      {Array.from({ length: months + 1 }, (_, i) => i).filter((i) => i % 3 === 0).map((i) => (
        <text key={i} x={px(i)} y={ch - 8} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 8, fill: FAINT, letterSpacing: '.06em' }}>
          M{i}
        </text>
      ))}

      <path d={`${toPath(supported)} L${px(months)} ${py(0)} L${px(0)} ${py(0)} Z`} fill={BLUE} fillOpacity={0.07 * reveal} />
      <path d={toPath(baseline)} fill="none" stroke={MUTED} strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      <path
        d={toPath(supported)}
        fill="none"
        stroke={BLUE}
        strokeWidth="2.2"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - reveal}
      />
      {supported.map((v, i) =>
        i % 3 === 0 ? <rect key={i} x={px(i) - 2.4} y={py(v) - 2.4} width="4.8" height="4.8" fill={BLUE} opacity={reveal} /> : null
      )}
      {baseline.map((v, i) => (i % 3 === 0 ? <rect key={i} x={px(i) - 2.4} y={py(v) - 2.4} width="4.8" height="4.8" fill={MUTED} /> : null))}
    </svg>
  );
}

export const CHART_LEGEND = [
  { label: 'Fat mass', colour: BLUE },
  { label: 'Lean mass', colour: BLUE_DEEP },
  { label: 'Other tissue', colour: BLUE_MID },
];

export { BLUE_WASH, BODY, LINE, BLUE_SOFT };
