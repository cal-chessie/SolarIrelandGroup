'use client';

import { useState } from 'react';
import { ArrowRight, Check, ChevronRight, CircleCheck } from 'lucide-react';
import { SOLAR_DATA, WELFARE_HIGHER_GRANT, ndmgDoubledLive } from '@/lib/solar-data';
import { intakeHref, openIntake } from '@/lib/intake/open';

/**
 * Grants (homepage only, #grant-info). Restructure, 11 Nov 2026.
 *
 * Before, the H2 said "Up to €1,800" while the analyser said "up to €2,400",
 * and the grant appeared in four places. Now one definition list carries
 * every grant figure, each read from SOLAR_DATA / WELFARE_HIGHER_GRANT, and
 * the eligibility checker ends in "Check my savings" (DECISIONS.md R6). The
 * "how the grant works" timeline moved into the merged process section.
 */
const eur0 = (n: number) => `€${n.toLocaleString('en-IE')}`;

type CheckResult = 'yes' | 'no' | 'unsure' | null;

interface CheckStep {
  id: string;
  question: string;
  options: { label: string; value: CheckResult }[];
  detail: string;
}

const checkSteps: CheckStep[] = [
  {
    id: 'owner',
    question: 'Do you own your home?',
    options: [
      { label: 'Yes, I own it', value: 'yes' },
      { label: 'No, I rent', value: 'no' },
      { label: 'Not sure', value: 'unsure' },
    ],
    detail: 'The SEAI grant is for homeowners, including private landlords. A tenant cannot apply, but their landlord can.',
  },
  {
    id: 'year',
    question: 'When was your home built?',
    options: [
      { label: 'Before 2025', value: 'yes' },
      { label: '2025 or later', value: 'no' },
      { label: 'Not sure', value: 'unsure' },
    ],
    detail: 'Homes built and occupied before 2025 qualify.',
  },
  {
    // There is no minimum BER in the scheme; previous solar funding at the
    // same MPRN is the real disqualifier.
    id: 'previous-grant',
    question: 'Has this property had a solar grant before?',
    options: [
      { label: 'No, first time', value: 'yes' },
      { label: 'Yes, already claimed', value: 'no' },
      { label: 'Not sure', value: 'unsure' },
    ],
    detail: 'The grant is one per property, tied to the MPRN on your bill. There is no minimum BER: the BER is done after the work, and we book it for you.',
  },
  {
    // Not a test you can fail: it only decides which grant the result names.
    id: 'fuel',
    question: 'Do you get the Fuel Allowance?',
    options: [
      { label: 'Yes, I get it', value: 'yes' },
      { label: 'No', value: 'unsure' },
    ],
    detail: 'SEAI pays a higher solar grant on certain welfare payments, and the Fuel Allowance is one of them.',
  },
];

/** Steps that can rule someone out. The Fuel Allowance step only changes which grant the result names. */
const GATE_STEPS = new Set(['owner', 'year', 'previous-grant']);

function EligibilityChecker() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CheckResult>>({});
  const [isComplete, setIsComplete] = useState(false);

  const step = checkSteps[currentStep];

  const handleAnswer = (value: CheckResult) => {
    setAnswers({ ...answers, [step.id]: value });
    if (currentStep < checkSteps.length - 1) setCurrentStep(currentStep + 1);
    else setIsComplete(true);
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
  };

  const gated = Object.entries(answers).filter(([k]) => GATE_STEPS.has(k)).map(([, v]) => v);
  const hasNo = gated.some((v) => v === 'no');
  const hasUnsure = gated.some((v) => v === 'unsure');
  const onFuel = answers.fuel === 'yes';

  return (
    <div className="h-check" aria-live="polite">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="h-item">Am I eligible?</h3>
        {isComplete ? (
          <button type="button" onClick={reset} className="h-quiet !min-h-0 !text-[13px]">
            Start again
          </button>
        ) : (
          <span className="h-fine h-fig">
            {currentStep + 1} of {checkSteps.length}
          </span>
        )}
      </div>
      {!isComplete && (
        <div className="h-check__bar" aria-hidden="true">
          {checkSteps.map((s, i) => (
            <span key={s.id} data-on={i < currentStep ? 'done' : i === currentStep ? 'now' : undefined} />
          ))}
        </div>
      )}

      {!isComplete ? (
        <div key={step.id} className="h-check__step mt-6">
          <p className="h-item">{step.question}</p>
          <p className="h-body mt-1">{step.detail}</p>
          <div className="mt-5 grid gap-2">
            {step.options.map((opt) => (
              <button key={opt.label} type="button" onClick={() => handleAnswer(opt.value)} className="h-opt">
                <span className="h-opt__label">
                  {opt.value === 'yes' ? <Check className="h-opt__yes" aria-hidden="true" /> : null}
                  {opt.label}
                </span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      ) : !hasNo ? (
        <div className="h-check__step mt-6">
          <div className="h-yes">
            <p className="h-yes__h">
              <CircleCheck className="h-yes__icon" aria-hidden="true" />
              {hasUnsure ? 'You likely qualify' : 'You qualify'}
            </p>
            <p className="h-body mt-2">
              Based on your answers, you look eligible for the SEAI solar grant: up to {SOLAR_DATA.grant.label} for panels,
              and {SOLAR_DATA.batteryGrant.label} more with a battery of {SOLAR_DATA.batteryGrant.minLabel}.
            </p>
            {onFuel ? (
              <p className="h-body mt-2" data-fuel-allowance="">
                On the Fuel Allowance, SEAI&apos;s higher grant goes up to {eur0(WELFARE_HIGHER_GRANT.solarMaxEur)} for panels and{' '}
                {eur0(WELFARE_HIGHER_GRANT.batteryEur)} for a battery, up to {eur0(WELFARE_HIGHER_GRANT.totalMaxEur)} in all.{' '}
                <a href={WELFARE_HIGHER_GRANT.source} target="_blank" rel="noopener noreferrer">
                  SEAI&apos;s guide
                </a>
              </p>
            ) : null}
            {hasUnsure && <p className="h-fine mt-2">We confirm the rest with you on the call.</p>}
          </div>
          <p className="h-item mt-6">Now see what it saves you.</p>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <a href="#calculator" className="h-btn">
              Check my savings
              <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
            </a>
            <a
              href={intakeHref({ door: 'grant-checker-manual', segment: 'home', step: 'bill' })}
              onClick={(e) => {
                e.preventDefault();
                openIntake({ door: 'grant-checker-manual', segment: 'home', step: 'bill' });
              }}
              className="h-quiet justify-center"
            >
              Type my bill amount
            </a>
          </div>
        </div>
      ) : (
        <div className="h-check__step mt-6">
          <p className="h-no__h">Not eligible for the grant right now</p>
          <p className="h-body mt-2">
            Based on your answers, you don&apos;t appear to qualify for the SEAI grant. Solar panels can still save you money
            without it, and your bill shows how much.
          </p>
          <a href="#calculator" className="h-text-cta mt-4">
            Check my savings
            <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

export default function GrantInfo() {
  const ndmg = SOLAR_DATA.ndmgDoubled;
  const showNdmg = ndmgDoubledLive();
  return (
    <section id="grant-info" className="h-sec" aria-labelledby="grant-title">
      <div className="h-glow-clip" aria-hidden="true">
        <div className="h-glow" aria-hidden="true" style={{ width: 720, height: 520, right: '-12%', top: '18%' }} />
      </div>
      <div className="h-wrap relative">
        <div className="h-split">
          <div>
            <div data-reveal="">
              <span className="h-kicker">
                <span className="h-ring" aria-hidden="true" />
                SEAI grants
              </span>
              <h2 id="grant-title" className="h-title">
                Up to {SOLAR_DATA.batteryGrant.withSolarMaxLabel} back on your home.
              </h2>
              <p className="h-lead">
                SEAI pays it after the work, for homes built and occupied before 2025. Panels on a home carry 0% VAT. We walk you through the application.
              </p>
            </div>

            <dl className="h-dl mt-12" data-reveal="" style={{ ['--d' as string]: 1 }}>
              <div>
                <dt>
                  Your home
                  <small>
                    {SOLAR_DATA.grant.label} for solar panels, plus {SOLAR_DATA.batteryGrant.label} with a battery of{' '}
                    {SOLAR_DATA.batteryGrant.minLabel}
                  </small>
                </dt>
                <dd>
                  <small>up to</small>
                  {SOLAR_DATA.batteryGrant.withSolarMaxLabel}
                </dd>
              </div>
              {showNdmg ? (
                <div>
                  <dt>
                    Your business
                    <small>
                      {ndmg.name}, doubled until {ndmg.toLabel}
                    </small>
                  </dt>
                  <dd>
                    <small>up to</small>
                    {ndmg.maxLabel}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>
                  On the Fuel Allowance
                  <small>SEAI&apos;s higher grant for qualifying welfare payments</small>
                </dt>
                <dd>
                  <small>up to</small>
                  {eur0(WELFARE_HIGHER_GRANT.totalMaxEur)}
                </dd>
              </div>
            </dl>
            <p className="h-fine mt-4" data-reveal="">
              Set by SEAI and may change. Current details on{' '}
              <a
                href="https://www.seai.ie/grants/home-energy-grants/individual-grants/solar-electricity-grant"
                target="_blank"
                rel="noopener noreferrer"
              >
                seai.ie
              </a>
              .
            </p>
          </div>

          <div data-reveal="" style={{ ['--d' as string]: 2 }}>
            <EligibilityChecker />
          </div>
        </div>
      </div>
    </section>
  );
}
