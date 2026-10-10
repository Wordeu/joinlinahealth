export const PRICE_PER_PATIENT = 10;

export type PricingScenario = {
  patients: number;
  programmeUplift: number;
  retainedPercent: number;
  prescriptionMargin: number;
};

/** One month's supported patients, including those retained by the programme. */
export function calculatePricingScenario({ patients, programmeUplift, retainedPercent, prescriptionMargin }: PricingScenario) {
  const retainedPatients = patients * retainedPercent / 100;
  const programmeIncome = patients * programmeUplift;
  const retentionMargin = retainedPatients * prescriptionMargin;
  const linaFee = patients * PRICE_PER_PATIENT;
  const contribution = programmeIncome + retentionMargin - linaFee;
  const uncoveredFee = Math.max(0, linaFee - programmeIncome);
  const breakEvenPatients = uncoveredFee === 0 ? 0 : prescriptionMargin > 0 ? Math.ceil(uncoveredFee / prescriptionMargin) : null;

  return { retainedPatients, programmeIncome, retentionMargin, linaFee, contribution, breakEvenPatients };
}
