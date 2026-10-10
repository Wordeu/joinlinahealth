/* One fictional dataset, shared by every demonstration on the page.
   Nothing here is real patient data. If a number appears in two demos it is
   read from this file in both places, so the demos cannot drift apart. */

export type Approval = 'routine' | 'review' | 'clinician';
export type SignalTone = 'blue' | 'green' | 'amber' | 'red';

export type WeightPoint = { week: number; kg: number; label: string };

/* ── Linda ──────────────────────────────────────────────────────────── */

export const LINDA_START_KG = 94;

export const LINDA_WEIGHT: WeightPoint[] = [
  { week: 0, kg: 94.0, label: 'Day 0' },
  { week: 2, kg: 92.8, label: 'Week 2' },
  { week: 4, kg: 91.9, label: 'Week 4' },
  { week: 8, kg: 90.1, label: 'Month 2' },
  { week: 12, kg: 87.6, label: 'Month 3' },
  { week: 16, kg: 85.0, label: 'Month 4' },
  { week: 20, kg: 84.2, label: 'Month 5' },
  { week: 24, kg: 83.8, label: 'Month 6' },
];

/** Body composition is only measured when she comes in for a scan. */
export const LINDA_COMPOSITION = [
  { week: 0, fat: 38.6, lean: 51.9 },
  { week: 16, fat: 31.8, lean: 49.7 },
  { week: 24, fat: 31.2, lean: 49.9 },
];

export type Moment = {
  id: string;
  short: string;
  long: string;
  week: number;
  stage: string;
  weightKg: number;
  /** Measurements available to the provider at this point. */
  measurements: { label: string; value: string; note?: string }[];
  composition?: { fatKg: number; leanKg: number; fatDelta: number; leanDelta: number };
  signal: { tone: SignalTone; title: string; because: string; evidence: string };
  action: { title: string; detail: string; approval: Approval };
  thread: { from: 'clinic' | 'patient'; body: string; attachment?: string; state?: 'delivered' | 'read' | 'sent' }[];
  video: { title: string; scenes: string[] } | null;
  next: string;
};

export const LINDA_MOMENTS: Moment[] = [
  {
    id: 'day0',
    short: 'Day 0',
    long: 'Starting treatment',
    week: 0,
    stage: 'Week 1 · starting dose',
    weightKg: 94.0,
    measurements: [
      { label: 'Starting weight', value: '94.0 kg' },
      { label: 'Dose', value: '2.5 mg', note: 'weekly' },
      { label: 'Baseline scan', value: 'Taken', note: '38.6 kg fat · 51.9 kg lean' },
    ],
    signal: {
      tone: 'blue',
      title: 'First week of treatment',
      because: 'New patient, no messages sent yet.',
      evidence: 'Dispensed 2 Oct · baseline scan on file',
    },
    action: {
      title: 'Send the starting-out introduction',
      detail: 'What to expect in the first fortnight, and how to reach the pharmacy.',
      approval: 'routine',
    },
    thread: [
      { from: 'clinic', body: 'Hi Linda, your first pen is on its way. Here is what the first two weeks usually look like.', attachment: 'Getting started · 40s', state: 'read' },
      { from: 'patient', body: 'Thank you, that is helpful' },
    ],
    video: { title: 'Linda, here is what to expect', scenes: ['Your treatment', 'The first fortnight', 'Side effects', 'Eating well', 'Reaching us'] },
    next: 'Check in at the end of week 2.',
  },
  {
    id: 'week2',
    short: 'Week 2',
    long: 'Side-effect support',
    week: 2,
    stage: 'Week 2 · 2.5 mg',
    weightKg: 92.8,
    measurements: [
      { label: 'Weight', value: '92.8 kg', note: '−1.2 kg' },
      { label: 'Reported', value: 'Nausea', note: 'day 3 and day 5' },
      { label: 'Dose', value: '2.5 mg', note: 'unchanged' },
    ],
    signal: {
      tone: 'amber',
      title: 'Nausea reported twice',
      because: 'Two reports in one week, both after the injection day.',
      evidence: 'Patient replies · 8 Oct, 10 Oct',
    },
    action: {
      title: 'Send general side-effect guidance, flag for the pharmacist',
      detail: 'Routine guidance goes now. A pharmacist reads the thread before anything about the dose is said.',
      approval: 'review',
    },
    thread: [
      { from: 'patient', body: 'Feeling pretty sick the day after my injection' },
      { from: 'clinic', body: 'Sorry to hear that, Linda. Smaller meals and plenty of fluids help most people. I have asked our pharmacist to look at your notes today.', state: 'read' },
      { from: 'patient', body: 'Ok, thank you' },
    ],
    video: null,
    next: 'Pharmacist reviews before the next dose step.',
  },
  {
    id: 'month2',
    short: 'Month 2',
    long: 'Progress',
    week: 8,
    stage: 'Month 2 · 5 mg',
    weightKg: 90.1,
    measurements: [
      { label: 'Weight', value: '90.1 kg', note: '−3.9 kg' },
      { label: 'Dose', value: '5 mg', note: 'stepped up week 5' },
      { label: 'Side effects', value: 'Settled', note: 'none reported for 3 weeks' },
    ],
    signal: {
      tone: 'green',
      title: 'Steady progress, side effects settled',
      because: 'Weight down each fortnight, no reports since the dose step.',
      evidence: '4 weigh-ins · last reply 2 Dec',
    },
    action: {
      title: 'Send a short progress update',
      detail: 'Her own numbers, not a generic encouragement message.',
      approval: 'routine',
    },
    thread: [
      { from: 'clinic', body: 'Two months in, Linda. Here is how it is going so far.', attachment: 'Your 2-month update · 30s', state: 'read' },
      { from: 'patient', body: 'Nice to see it written down like that' },
    ],
    video: { title: 'Linda, two months in', scenes: ['Your progress', 'Your journey', 'What changed', 'What this means', 'Your next step'] },
    next: 'Invite her in for a scan at month 4.',
  },
  {
    id: 'month4',
    short: 'Month 4',
    long: 'Body composition',
    week: 16,
    stage: 'Month 4 · 7.5 mg',
    weightKg: 85.0,
    measurements: [
      { label: 'Weight', value: '85.0 kg', note: '−9.0 kg' },
      { label: 'Fat mass', value: '31.8 kg', note: '−6.8 kg since baseline' },
      { label: 'Lean mass', value: '49.7 kg', note: '−2.2 kg since baseline' },
      { label: 'Scan', value: '12 Feb', note: 'in pharmacy' },
    ],
    composition: { fatKg: 31.8, leanKg: 49.7, fatDelta: -6.8, leanDelta: -2.2 },
    signal: {
      tone: 'blue',
      title: 'Four-month review ready',
      because: 'A new scan means weight can be separated into fat and lean mass.',
      evidence: 'Scan 12 Feb · baseline scan 2 Oct',
    },
    action: {
      title: 'Prepare the four-month progress review',
      detail: 'A personalised video built from her two scans, plus an offer to talk it through.',
      approval: 'routine',
    },
    thread: [
      { from: 'clinic', body: 'Linda, your four-month review is ready. It covers what the scan showed, not just the scales.', attachment: 'Your 4-month review · 40s', state: 'read' },
      { from: 'patient', body: 'Watched it. Can I book in to talk about the strength part?' },
      { from: 'clinic', body: 'Of course. Thursday 4pm or Saturday morning?', state: 'delivered' },
    ],
    video: { title: 'Linda, here is your four-month progress', scenes: ['Your progress', 'Your journey', 'Beyond your weight', 'What this means', 'Your next step'] },
    next: 'Book a strength and protein conversation with the pharmacy team.',
  },
  {
    id: 'month6',
    short: 'Month 6',
    long: 'Continued care',
    week: 24,
    stage: 'Month 6 · 7.5 mg',
    weightKg: 83.8,
    measurements: [
      { label: 'Weight', value: '83.8 kg', note: '−10.2 kg' },
      { label: 'Last 8 weeks', value: '−1.2 kg', note: 'slowing' },
      { label: 'Lean mass', value: '49.9 kg', note: '+0.2 kg since month 4' },
    ],
    composition: { fatKg: 31.2, leanKg: 49.9, fatDelta: -7.4, leanDelta: -2.0 },
    signal: {
      tone: 'amber',
      title: 'Weight loss has flattened',
      because: 'Under 1.5 kg across eight weeks after a steady first four months.',
      evidence: '3 weigh-ins · scan 14 Apr',
    },
    action: {
      title: 'Open the maintenance conversation',
      detail: 'A plateau is a decision point, not a failure. Prescriber decides what happens to the dose.',
      approval: 'clinician',
    },
    thread: [
      { from: 'clinic', body: 'Your weight has levelled off, Linda, and your lean mass has held. Worth a conversation about what comes next.', state: 'read' },
      { from: 'patient', body: 'Does that mean I stop?' },
      { from: 'clinic', body: 'Not necessarily. Our prescriber will go through the options with you on Tuesday.', state: 'delivered' },
    ],
    video: { title: 'Linda, what a plateau means', scenes: ['Where you are', 'Your journey', 'Why it slows', 'What this means', 'Your next step'] },
    next: 'Prescriber call booked for Tuesday.',
  },
];

export const LINDA = {
  id: 'linda',
  name: 'Linda',
  surname: 'Hartley',
  initials: 'LH',
  age: 51,
  treatment: 'GLP-1 · 7.5 mg',
};

/* ── The provider's list ────────────────────────────────────────────── */

export type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  treatment: string;
  stage: string;
  lastActivity: string;
  /** Where the row sits before Lina prioritises the list. */
  restingStatus: string;
  priority: number | null;
  tone: SignalTone;
  signalLabel: string;
  signal: { title: string; because: string; evidence: string };
  action: { title: string; detail: string; approval: Approval };
  outcome: string;
  message: { body: string; attachment?: string };
  /** Chapter titles of the personalised video, used as its lower thirds. */
  videoScenes?: string[];
  /** The weigh-ins the video is drawn from, so the number on the playhead is
   *  the patient's own rather than a stand-in. */
  videoLine?: WeightPoint[];
  chart: number[];
  summary: { label: string; value: string }[];
};

export const PATIENTS: Patient[] = [
  {
    id: 'linda',
    name: 'Linda Hartley',
    initials: 'LH',
    age: 51,
    treatment: 'Tirzepatide 7.5 mg',
    stage: 'Month 4',
    lastActivity: 'Scan · 2 days ago',
    restingStatus: 'Active',
    priority: 1,
    tone: 'blue',
    signalLabel: 'Review measurements',
    signal: {
      title: 'Four-month review ready',
      because: 'A new body composition scan can be compared against her baseline.',
      evidence: 'Scan 12 Feb · baseline 2 Oct · 9.0 kg down',
    },
    action: {
      title: 'Prepare four-month progress review',
      detail: 'Personalised video from both scans, with an offer to book a conversation.',
      approval: 'routine',
    },
    outcome: 'Review viewed · replied',
    message: { body: 'Linda, your four-month review is ready. It covers what the scan showed, not just the scales.', attachment: 'Your 4-month review · 40s' },
    videoScenes: ['Your progress', 'Your journey', 'Beyond your weight', 'What this means', 'Your next step'],
    videoLine: LINDA_WEIGHT.filter((p) => p.week <= 16),
    chart: [94, 92.8, 91.9, 90.1, 87.6, 85],
    summary: [
      { label: 'Weight', value: '85.0 kg · −9.0' },
      { label: 'Fat mass', value: '31.8 kg · −6.8' },
      { label: 'Lean mass', value: '49.7 kg · −2.2' },
    ],
  },
  {
    id: 'rachel',
    name: 'Rachel Okafor',
    initials: 'RO',
    age: 42,
    treatment: 'Semaglutide 1.0 mg',
    stage: 'Month 7',
    lastActivity: 'Dispensed · 37 days ago',
    restingStatus: 'Active',
    priority: 2,
    tone: 'amber',
    signalLabel: 'Refill overdue',
    signal: {
      title: 'Refill is nine days late',
      because: 'Her previous six refills all landed within three days of the due date.',
      evidence: 'Last dispensed 37 days ago · usual interval 28 days',
    },
    action: {
      title: 'Send a check-in before she drops off',
      detail: 'Ask whether she means to continue, rather than sending another reminder.',
      approval: 'routine',
    },
    outcome: 'Check-in sent',
    message: { body: 'Hi Rachel, we have not seen a reorder this month. Are you planning to carry on, or would it help to talk it through?' },
    chart: [101, 99.4, 97.1, 95.8, 94.9, 94.6],
    summary: [
      { label: 'Weight', value: '94.6 kg · −6.4' },
      { label: 'Refills', value: '6 on time, 1 late' },
      { label: 'Last reply', value: '24 days ago' },
    ],
  },
  {
    id: 'david',
    name: 'David Mensah',
    initials: 'DM',
    age: 48,
    treatment: 'Tirzepatide 5 mg',
    stage: 'Week 3',
    lastActivity: 'Message · 4 hours ago',
    restingStatus: 'Active',
    priority: 3,
    tone: 'red',
    signalLabel: 'Side effects reported',
    signal: {
      title: 'Nausea reported on four separate days',
      because: 'Still reporting after two weeks, and he has mentioned skipping meals.',
      evidence: '4 reports since 3 Mar · dose stepped up 1 Mar',
    },
    action: {
      title: 'Escalate to the pharmacist',
      detail: 'Lina does not answer this one. The thread and the reports go to a clinician.',
      approval: 'clinician',
    },
    outcome: 'With the pharmacist',
    message: { body: 'Thanks David. Our pharmacist is reading through your messages this morning and will come back to you today.' },
    chart: [112, 111.2, 110.6, 110.1, 109.8, 109.5],
    summary: [
      { label: 'Weight', value: '109.5 kg · −2.5' },
      { label: 'Reports', value: '4 · nausea' },
      { label: 'Dose', value: 'Stepped up 1 Mar' },
    ],
  },
  {
    id: 'sofia',
    name: 'Sofia Marchetti',
    initials: 'SM',
    age: 39,
    treatment: 'Tirzepatide 2.5 mg',
    stage: 'Week 8',
    lastActivity: 'Weigh-in · yesterday',
    restingStatus: 'Active',
    priority: 4,
    tone: 'green',
    signalLabel: 'Progress milestone',
    signal: {
      title: 'Eight weeks in, progress on track',
      because: 'She has weighed in every fortnight and has not missed a refill.',
      evidence: '4 weigh-ins · 2 refills on time',
    },
    action: {
      title: 'Send the eight-week progress video',
      detail: 'Her own chart, and a prompt to book her month-3 scan.',
      approval: 'routine',
    },
    outcome: 'Video delivered',
    message: { body: 'Eight weeks in, Sofia. Here is your progress so far, and when to book your next scan.', attachment: 'Your 8-week update · 30s' },
    videoScenes: ['Your first eight weeks', 'Your journey', 'What changed', 'Your next scan'],
    videoLine: [
      { week: 0, kg: 88.0, label: 'Day 0' },
      { week: 2, kg: 87.1, label: 'Week 2' },
      { week: 4, kg: 86.2, label: 'Week 4' },
      { week: 6, kg: 85.0, label: 'Week 6' },
      { week: 8, kg: 84.1, label: 'Week 8' },
    ],
    chart: [88, 87.1, 86.2, 85.4, 84.6, 84.1],
    summary: [
      { label: 'Weight', value: '84.1 kg · −3.9' },
      { label: 'Weigh-ins', value: '4 of 4' },
      { label: 'Next scan', value: 'Not booked' },
    ],
  },
];

/** Filler rows so the unsorted list looks like working software. */
export const QUIET_PATIENTS = [
  { id: 'q1', name: 'Marcus Bell', initials: 'MB', treatment: 'Semaglutide 0.5 mg', stage: 'Month 2', lastActivity: 'Dispensed · 6 days ago' },
  { id: 'q2', name: 'Priya Raman', initials: 'PR', treatment: 'Tirzepatide 10 mg', stage: 'Month 9', lastActivity: 'Weigh-in · 3 days ago' },
  { id: 'q3', name: 'Tom Alderton', initials: 'TA', treatment: 'Tirzepatide 5 mg', stage: 'Month 5', lastActivity: 'Reply · 5 days ago' },
  { id: 'q4', name: 'Jean Okonkwo', initials: 'JO', treatment: 'Semaglutide 1.7 mg', stage: 'Month 11', lastActivity: 'Dispensed · 9 days ago' },
  { id: 'q5', name: 'Hannah Pryce', initials: 'HP', treatment: 'Tirzepatide 2.5 mg', stage: 'Week 5', lastActivity: 'Weigh-in · 2 days ago' },
  { id: 'q6', name: 'Owen Baptiste', initials: 'OB', treatment: 'Semaglutide 0.25 mg', stage: 'Week 2', lastActivity: 'Reply · 1 day ago' },
  { id: 'q7', name: 'Nadia Farrow', initials: 'NF', treatment: 'Tirzepatide 7.5 mg', stage: 'Month 6', lastActivity: 'Dispensed · 11 days ago' },
];

/* ── Labels used in more than one place ─────────────────────────────── */

export const APPROVAL_LABEL: Record<Approval, { text: string; tone: SignalTone }> = {
  routine: { text: 'Approved pathway', tone: 'green' },
  review: { text: 'Needs a pharmacist', tone: 'amber' },
  clinician: { text: 'Clinician decision', tone: 'red' },
};

export const PROVIDER = 'Bridge Street Pharmacy';
