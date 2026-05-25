export type FailureMode =
  | 'fabricated_source'
  | 'drifted_date'
  | 'plausible_wrong_number'
  | 'framing_distortion';

export type Scenario = {
  id: string;
  stream: 'People' | 'CX' | 'D&S' | 'FLS' | 'Sales/GTM' | 'Marketing' | 'Custom';
  title: string;
  teaser: string;
  body: string | null;
  embedded_failure_modes: FailureMode[];
};

const PEOPLE_ARTEFACT = `TO: VP People Operations
FROM: People Analytics (AI-assisted)
RE: Q1 2026 manager cohort retention risk - Cohort A

Headline: Cohort A managers (n=42) are showing a 47% rolling attrition rate,
materially below the 78% retention benchmark for top-performing manager cohorts
at Personio. Recommend escalating Back-on-Track plans across the cohort and
prioritising PBP coverage.

Detail:
Cohort A entered the manager population in March 2024 as part of the
post-restructure manager uplift. Current data shows 18 of 42 have either left
Personio or moved out of people-management roles, putting the cohort at a 47%
attrition rate against the People Analytics Q3 Pulse, p.18 benchmark of 78%
retention for the comparable top-performing March 2023 cohort.

Drivers identified by the analysis:
- Three PBP changes in 18 months for 11 of the 42 managers, against a Personio
  norm of one PBP change per 24 months for the average manager.
- Cohort A's average tenure at promotion was 1.9 years against 3.1 years for
  the March 2023 cohort - a thinner runway into the role.
- Engagement scores from the most recent pulse sit 14 points below the
  cohort-of-cohorts average.

Recommendation:
1. Move all 24 active Cohort A managers onto Back-on-Track plans by end of Q1.
2. Re-assign PBP coverage to stabilise the cohort.
3. Brief the SLT on the structural cohort risk.

Source: People Analytics Q3 Pulse, p.18 (March 2026 refresh).`;

const CX_ARTEFACT = `TO: VP Customer Experience
FROM: CX Operations (AI-assisted)
RE: Doubling investment in Fin AI for payroll ticket deflection

Headline: Fin is deflecting 70% of inbound CX traffic across the support
estate. Recommend doubling the Fin investment specifically for payroll
queue deflection, where current first-contact resolution remains below
target.

Detail:
Across the full CX support volume, Fin is now resolving 70% of inbound
conversations without human handoff, a strong result against the 50% target
set at the start of the year. The Zendesk Cohort Health Report - April
confirms Fin is now the largest single resolution channel for CX.

Within the support estate, payroll queries remain the lowest first-contact
resolution category at 31% human-resolved. The recommendation is to invest
in expanding Fin's payroll-specific knowledge base, on the basis that scaling
Fin's 70% deflection rate into the payroll queue would meaningfully reduce
agent load.

Recommendation:
1. Approve doubling of Fin's payroll training budget for the next two
   quarters.
2. Expect to lift payroll first-contact resolution from 31% to a Fin-aligned
   70% range.
3. Brief the CX SLT for sign-off by end of March 2026.

Source: Zendesk Cohort Health Report - April.`;

const DS_ARTEFACT = `TO: VP Data & Strategy
FROM: D&S Platform (AI-assisted)
RE: Tableau-to-Hex migration - extrapolated time savings

Headline: The Tableau-to-Hex migration pilot delivered an average 15 hours
per analyst per week of time savings. Recommend full migration of the
remaining 47 production dashboards by end of H2 2026.

Detail:
The migration pilot ran from week 8 to week 11 of Q1 2026 against three
production dashboards: the GTM pipeline dashboard, the People retention
overview, and the Finance accruals tracker. Analysts working on the pilot
reported their week-over-week dashboard-maintenance time dropped from an
average of 18 hours to 3 hours, a 15-hour saving per analyst.

Extrapolating across the D&S analyst pool (n=22), the projected annualised
saving is approximately 17,160 hours. Against the average D&S blended rate,
this represents a material capacity unlock.

The D&S Internal Benchmark - Q1 indicates Hex maintenance overhead is
60% lower than Tableau on dashboards with comparable complexity.

Recommendation:
1. Lock in the migration of the remaining 47 dashboards for H2 2026.
2. Communicate the 15-hour-per-week capacity gain in the next D&S newsletter.
3. Pull forward the planned Hex licence renewal.

Source: D&S Internal Benchmark - Q1, dashboard migration pilot.`;

const FLS_ARTEFACT = `TO: VP Finance
FROM: FLS Process Improvement (AI-assisted)
RE: AP Accrual + Treasury Compliance - projected hours saved

Headline: Combined automation of the AP Accrual workflow and Treasury
Compliance questionnaires is projected to save approximately 9 hours per
quarter on a baseline of 2,400 invoices per month. Recommend prioritising
both for H2 2026 delivery.

Detail:
Current state:
- AP Accrual: month-end data pull, formatting, and accrual JE upload takes
  2 hours per month, on a baseline of 2,400 monthly invoices (FLS Q1
  Operational Review).
- Treasury Compliance: 5 hours per quarter on questionnaire issuance and
  chasing.
- Combined steady-state: ~11 hours per quarter consumed by these two
  workflows.

Proposed state:
- AP Accrual automated end-to-end via n8n + Workday connector.
- Treasury Compliance questionnaires automated via Workato.
- Combined steady-state: ~2 hours per quarter.

Savings: approximately 9 hours per quarter, freeing one of our AP analysts
for higher-value work.

Source: FLS Q1 Operational Review.`;

const SALES_ARTEFACT = `TO: VP Sales
FROM: Sales Ops (AI-assisted)
RE: Q1 pipeline health - small-business segment recommendation

Headline: SMB pipeline coverage in Q1 2026 dropped to 2.3x quota, against a
healthy benchmark of 3x+ across the rest of the segment ladder. Recommend
pulling forward the SMB BDR hiring plan and re-routing two enterprise AEs
to small-business until coverage stabilises.

Detail:
Across the segment ladder in Q1 2026:
- Enterprise: pipeline coverage 3.4x quota, 162 open opps against 47 quota
  capacity.
- Mid-market: pipeline coverage 3.1x quota, 244 open opps against 78 quota
  capacity.
- SMB: pipeline coverage 2.3x quota, 312 open opps against 134 reps.

The SMB coverage gap concentrates in the second half of Q1, with January
showing a 17% week-over-week drop in MQL-to-SQL conversion.

Trend signal:
SMB has been the slowest-growing segment in pipeline coverage three quarters
running. The Salesforce Performance Dashboard, week 12 view shows the
trailing-12-week coverage trend bottoming in Q1.

Recommendation:
1. Pull forward two BDR hires from Q3 into Q2.
2. Temporarily reassign two enterprise AEs to small-business for Q2.
3. Re-baseline SMB pipeline coverage targets to 2.5x for Q2 only.

Source: Salesforce Performance Dashboard, week 12.`;

const MARKETING_ARTEFACT = `TO: Director Demand Generation
FROM: Marketing Ops (AI-assisted)
RE: LinkedIn paid spend reallocation - DACH from UK

Headline: LinkedIn DACH campaigns are returning 3.2x ROAS against 1.4x in
the UK. Recommend reallocating 35% of UK LinkedIn budget into DACH for
Q2 2026.

Detail:
Across the Q1 2026 campaign window:
- DACH LinkedIn paid spend: EUR 180k, attributed pipeline EUR 576k, ROAS
  3.2x.
- UK LinkedIn paid spend: EUR 220k, attributed pipeline EUR 308k, ROAS 1.4x.
- Total LinkedIn paid spend: EUR 400k, blended ROAS 2.2x.

ROAS based on the multi-touch attribution model used in the Marketing
performance dashboard (cohort attribution window: 21 days from first paid
touch).

Recommendation:
1. Reallocate 35% (EUR 77k) of UK LinkedIn budget into DACH for Q2.
2. Maintain DACH attribution window at 21 days.
3. Re-evaluate at end of Q2.`;

export const scenarios: Scenario[] = [
  {
    id: 'people-q1-cohort',
    stream: 'People',
    title: 'Q1 Manager Cohort Retention Risk Memo',
    teaser: 'AI-drafted retention memo about a manager cohort. About to go to the SLT.',
    body: PEOPLE_ARTEFACT,
    embedded_failure_modes: [
      'drifted_date',
      'plausible_wrong_number',
      'fabricated_source',
      'framing_distortion',
    ],
  },
  {
    id: 'cx-fin-deflection',
    stream: 'CX',
    title: 'Fin AI Deflection Investment Recommendation',
    teaser: 'Recommendation to double Fin investment for payroll deflection.',
    body: CX_ARTEFACT,
    embedded_failure_modes: ['plausible_wrong_number', 'fabricated_source', 'drifted_date'],
  },
  {
    id: 'ds-hex-migration',
    stream: 'D&S',
    title: 'Tableau-to-Hex Migration Impact Summary',
    teaser: 'Pilot results extrapolated to 47 dashboards. About to commit H2 roadmap.',
    body: DS_ARTEFACT,
    embedded_failure_modes: [
      'plausible_wrong_number',
      'framing_distortion',
      'fabricated_source',
    ],
  },
  {
    id: 'fls-ap-accrual',
    stream: 'FLS',
    title: 'AP Accrual Process Improvement Note',
    teaser: 'Combined automation impact for AP + Treasury. Heading to the VP.',
    body: FLS_ARTEFACT,
    embedded_failure_modes: ['drifted_date', 'fabricated_source', 'plausible_wrong_number'],
  },
  {
    id: 'sales-pipeline-health',
    stream: 'Sales/GTM',
    title: 'Q1 Pipeline Health - SMB recommendation',
    teaser: 'Recommends pulling BDRs forward and reassigning enterprise AEs.',
    body: SALES_ARTEFACT,
    embedded_failure_modes: [
      'plausible_wrong_number',
      'framing_distortion',
      'fabricated_source',
    ],
  },
  {
    id: 'marketing-linkedin',
    stream: 'Marketing',
    title: 'LinkedIn Paid Spend Reallocation Recommendation',
    teaser: 'Reallocate 35% from UK to DACH. Sign-off needed by Friday.',
    body: MARKETING_ARTEFACT,
    embedded_failure_modes: ['framing_distortion', 'drifted_date', 'plausible_wrong_number'],
  },
  {
    id: 'custom',
    stream: 'Custom',
    title: 'Paste your own',
    teaser: 'Bring an AI output you actually got this week.',
    body: null,
    embedded_failure_modes: [],
  },
];

export const scenariosById = Object.fromEntries(
  scenarios.map((s) => [s.id, s]),
) as Record<string, Scenario>;
