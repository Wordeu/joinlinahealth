'use client';

import { useState } from 'react';
import { calculatePricingScenario, PRICE_PER_PATIENT } from './pricing-model';
import { BLUE, BLUE_SOFT, BLUE_WASH, BODY, INK, LINE, MUTED, Mono } from './ui';

const formatNumber = (value: number) => value.toLocaleString('en-GB', { maximumFractionDigits: 2 });
const formatMoney = (value: number) => (value < 0 ? '−' : '') + '£' + formatNumber(Math.abs(value));

const FIELDS = [
  { key: 'patients', label: 'Patients per month', help: 'Active patients using Lina.', max: 5000 },
  { key: 'programmeUplift', label: 'Extra monthly charge (£)', help: 'Per patient. Use £0 for no extra charge.', max: 100 },
  { key: 'retainedPercent', label: 'More patients staying (%)', help: 'Patients who would otherwise leave this month.', max: 100 },
  { key: 'prescriptionMargin', label: 'Prescription margin (£)', help: 'Per patient, per month, after drug and dispensing costs.', max: 500 },
] as const;

type FieldKey = typeof FIELDS[number]['key'];

export default function Commercial() {
  const [inputs, setInputs] = useState<Record<FieldKey, string>>({ patients: '100', programmeUplift: '20', retainedPercent: '10', prescriptionMargin: '40' });
  const validField = (key: FieldKey, max: number) => inputs[key].trim() !== '' && Number.isInteger(Number(inputs[key])) && Number(inputs[key]) >= 0 && Number(inputs[key]) <= max;
  const valid = FIELDS.every(({ key, max }) => validField(key, max));
  const patients = Number(inputs.patients);
  const model = valid ? calculatePricingScenario({
    patients,
    programmeUplift: Number(inputs.programmeUplift),
    retainedPercent: Number(inputs.retainedPercent),
    prescriptionMargin: Number(inputs.prescriptionMargin),
  }) : null;

  return (
    <div data-scene-step={0}>
      <p className="mb-6 max-w-[740px] text-[14px] leading-[1.7]" style={{ color: BODY }}>
        Add paid support. Keep more patients. See what your pharmacy could earn after Lina’s fee.
      </p>
      <div className="grid border bg-white lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)]" style={{ borderColor: LINE }}>
        <div className="border-b p-5 sm:p-7 lg:border-b-0 lg:border-r" style={{ borderColor: LINE }}>
          <Mono colour={BLUE}>Simple monthly pricing</Mono>
          <h3 className="mt-3 text-[24px] font-normal leading-[1.25] tracking-[-.03em]" style={{ color: INK }}>
            You set the patient price.
          </h3>
          <p className="mt-3 text-[13px] leading-[1.7]" style={{ color: BODY }}>
            Lina costs {formatMoney(PRICE_PER_PATIENT)} per active patient, per month. Any extra care charge above that stays with you.
          </p>

          <div className="mt-6 border" style={{ borderColor: LINE }}>
            <div className="border-b px-4 py-3" style={{ borderColor: LINE }}>
              <span className="text-[23px] font-semibold tracking-[-.03em]" style={{ color: INK }}>£20</span>
              <span className="ml-2 text-[12px]" style={{ color: BODY }}>extra charge · example</span>
            </div>
            <div className="grid grid-cols-2">
              <div className="border-r p-4" style={{ borderColor: LINE, background: BLUE_WASH }}>
                <p className="text-[12px] font-medium" style={{ color: BLUE }}>You keep</p>
                <p className="mt-2 text-[36px] font-semibold leading-none tracking-[-.04em]" style={{ color: BLUE }}>£10</p>
              </div>
              <div className="p-4">
                <p className="text-[12px]" style={{ color: BODY }}>Lina’s fee</p>
                <p className="mt-2 text-[36px] font-semibold leading-none tracking-[-.04em]" style={{ color: INK }}>{formatMoney(PRICE_PER_PATIENT)}</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-[1.6]" style={{ color: BODY }}>
            Per patient, per month. You also keep your prescription margin.
          </p>

          <ul className="mt-5 space-y-2.5">
            {[
              'Personal support in your pharmacy’s name',
              'More reasons for patients to stay',
              'Less chasing for your team',
            ].map(text => (
              <li key={text} className="flex items-start gap-2.5 text-[12px] leading-[1.6]" style={{ color: BODY }}>
                <span aria-hidden="true" style={{ color: BLUE }}>✓</span>{text}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[20px] font-medium leading-tight tracking-[-.02em]" style={{ color: INK }}>Model your pharmacy</h3>
          </div>
          <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: BODY }}>Change the numbers to see what you could keep.</p>

          <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            {FIELDS.map(({ key, label, help, max }) => {
              const showError = inputs[key] !== '' && !validField(key, max);
              return (
                <div key={key}>
                  <label htmlFor={`pricing-${key}`} className="block text-[12px] font-medium" style={{ color: INK }}>{label}</label>
                  <input
                    id={`pricing-${key}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={max}
                    step={1}
                    value={inputs[key]}
                    onChange={(event) => setInputs((current) => ({ ...current, [key]: event.target.value }))}
                    aria-describedby={`pricing-${key}-help${showError ? ` pricing-${key}-error` : ''}`}
                    aria-invalid={showError || undefined}
                    className="mt-2 h-11 w-full min-w-0 rounded-none border bg-white px-3 text-[18px] font-medium tabular-nums outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                    style={{ borderColor: showError ? '#BA3A2E' : LINE, color: INK }}
                  />
                  <p id={`pricing-${key}-help`} className="mt-1.5 text-[11px] leading-[1.5]" style={{ color: BODY }}>{help}</p>
                  {showError ? <p id={`pricing-${key}-error`} className="mt-1 text-[11px]" style={{ color: '#BA3A2E' }}>Enter a whole number from 0 to {formatNumber(max)}.</p> : null}
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="border p-4 sm:p-5" style={{ background: BLUE_WASH, borderColor: BLUE_SOFT }} aria-live="polite" aria-atomic="true">
              <p className="text-[13px] font-medium" style={{ color: INK }}>Extra money for your pharmacy</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[36px] font-semibold leading-none tabular-nums tracking-[-.045em] sm:text-[46px]" style={{ color: model && model.contribution < 0 ? '#BA3A2E' : BLUE }}>
                <span data-monthly-contribution>{model ? formatMoney(model.contribution) : '—'}</span>
                <span className="text-[14px] font-normal tracking-normal" style={{ color: BODY }}>/ month</span>
              </p>
              <p className="mt-3 text-[11px] leading-[1.6]" style={{ color: BODY }}>
                {model ? 'After Lina’s fee. Before any extra running costs.' : 'Fill in all four numbers to see your estimate.'}
              </p>
            </div>

            <details className="mt-3">
              <summary className="w-fit cursor-pointer py-1 text-[12px]" style={{ color: BLUE }}>See the breakdown</summary>
              <dl className="mt-3 space-y-3 text-[12px]">
                <div className="flex items-start justify-between gap-4">
                  <dt style={{ color: BODY }}>Extra care charges</dt>
                  <dd data-programme-income className="shrink-0 font-medium tabular-nums" style={{ color: INK }}>{model ? formatMoney(model.programmeIncome) : '—'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt style={{ color: BODY }}>
                    Margin from patients who stay
                    <span className="mt-1 block text-[11px]" style={{ color: MUTED }}>
                      {model ? `${formatNumber(model.retainedPatients)} more ${model.retainedPatients === 1 ? 'patient' : 'patients'} × ${formatMoney(Number(inputs.prescriptionMargin))}` : 'Based on your numbers'}
                    </span>
                  </dt>
                  <dd data-retention-margin className="shrink-0 font-medium tabular-nums" style={{ color: INK }}>{model ? '+' + formatMoney(model.retentionMargin) : '—'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t pt-3" style={{ borderColor: LINE }}>
                  <dt style={{ color: BODY }}>Lina’s fee <span className="text-[11px]">({formatMoney(PRICE_PER_PATIENT)} per patient)</span></dt>
                  <dd data-monthly-cost className="shrink-0 tabular-nums" style={{ color: BODY }}>{model ? '−' + formatMoney(model.linaFee) : '—'}</dd>
                </div>
              </dl>

              {model && patients > 0 ? <p className="mt-3 text-[12px] leading-[1.6]" style={{ color: BODY }}>
                {model.breakEvenPatients === 0
                  ? 'Your care charge covers Lina’s fee on its own.'
                  : model.breakEvenPatients === null || model.breakEvenPatients > patients
                    ? 'At these numbers, keeping more patients cannot cover the full fee.'
                    : `Keep ${formatNumber(model.breakEvenPatients)} more ${model.breakEvenPatients === 1 ? 'patient' : 'patients'} this month to cover the remaining fee.`}
              </p> : null}
            </details>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[12px] leading-[1.6]" style={{ color: MUTED }}>
        <p>An estimate, not a promise. Final pricing agreed with your pharmacy.</p>
        <details className="mt-2">
          <summary className="w-fit cursor-pointer text-[12px]" style={{ color: BODY }}>How the estimate works</summary>
          <p className="mt-2 max-w-[850px]">
            We add your care charges to the prescription margin from patients who stay, then subtract Lina’s fee.
            Your patient count includes those who stay because of Lina. We assume all of them pay your chosen care charge.
            The number who stay is your estimate, not a proven result. We leave out margin you already earn,
            new patients, time saved and extra running costs.
          </p>
        </details>
      </div>
    </div>
  );
}
