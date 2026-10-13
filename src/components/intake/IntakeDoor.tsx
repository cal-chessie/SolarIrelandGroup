'use client';

/**
 * The inline door (ui-spec 6.0): "What's your electricity bill?", a euro
 * field and "Show my estimate", with the quiet links under it. Used in the
 * home hero, the footer band, the end of every blog article and the
 * calculator page. Typing a bill opens the intake straight at Screen 2.
 *
 * Without JavaScript the form still works: it is a GET to /estimate.
 */
import './intake.css';
import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { intakeHref, openIntake, type DoorSegment } from '@/lib/intake/open';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { EuroInput, parseEuro } from './ui';

export default function IntakeDoor({
  door,
  segment = 'home',
  label = "What's your electricity bill?",
  whatsapp = false,
  bookLink = true,
  businessLink = true,
  id,
}: {
  door: string;
  segment?: DoorSegment;
  label?: string;
  whatsapp?: boolean;
  bookLink?: boolean;
  businessLink?: boolean;
  id?: string;
}) {
  const [value, setValue] = useState('');
  const fieldId = id || `si-door-${door}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const bill = parseEuro(value);
    openIntake({ door, segment, step: bill != null ? 'time' : 'bill', bill });
  };

  return (
    <form className="si-door" action="/estimate" method="get" onSubmit={submit}>
      <input type="hidden" name="for" value={segment} />
      <input type="hidden" name="step" value="time" />
      <input type="hidden" name="door" value={door} />
      <label className="si-door__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="si-door__row">
        <EuroInput
          id={fieldId}
          name="bill"
          placeholder="150"
          suffix="a month"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d.,€\s]/g, '').slice(0, 9))}
        />
        <button type="submit" className="si-btn si-btn--primary">
          <span>Show my estimate</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="si-door__links">
        {bookLink ? (
          <a
            href={intakeHref({ door: `${door}-book`, segment, step: 'time' })}
            onClick={(e) => {
              e.preventDefault();
              openIntake({ door: `${door}-book`, segment, step: 'time' });
            }}
          >
            Just book a free survey
          </a>
        ) : null}
        {bookLink && businessLink ? <span aria-hidden="true">·</span> : null}
        {businessLink ? (
          <a
            href={intakeHref({ door: `${door}-business`, segment: 'business', step: 'bill' })}
            onClick={(e) => {
              e.preventDefault();
              openIntake({ door: `${door}-business`, segment: 'business', step: 'bill' });
            }}
          >
            {segment === 'business' ? 'For a home instead' : 'Solar for a business'}
          </a>
        ) : null}
        {whatsapp ? (
          <>
            <span aria-hidden="true">·</span>
            <a href={buildWhatsAppUrl({ source: door })} target="_blank" rel="noopener noreferrer">
              Or WhatsApp us
            </a>
          </>
        ) : null}
      </p>
    </form>
  );
}
