'use client';

/**
 * Intake primitives. Every interactive element is at least 44 by 44, has a
 * visible focus state and a text label (ui-spec 5). Colour is never the only
 * signal: status is a word plus a mark.
 */
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight, CircleAlert } from 'lucide-react';

export function Spinner() {
  return <span className="si-spinner" aria-hidden="true" />;
}

export function PrimaryButton({
  label,
  busyLabel,
  busy,
  offline,
  type = 'submit',
  onClick,
  arrow = true,
  ariaLabel,
  form,
}: {
  label: ReactNode;
  busyLabel?: ReactNode;
  busy?: boolean;
  offline?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  arrow?: boolean;
  ariaLabel?: string;
  form?: string;
}) {
  return (
    <button
      type={type}
      form={form}
      className="si-btn si-btn--primary"
      data-primary="true"
      aria-disabled={busy || offline ? 'true' : undefined}
      data-offline={offline ? 'true' : undefined}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (busy || offline) {
          e.preventDefault();
          return;
        }
        onClick?.();
      }}
    >
      {busy ? (
        <>
          <Spinner />
          <span>{busyLabel || 'Working'}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {arrow && !offline ? <ArrowRight size={18} aria-hidden="true" /> : null}
        </>
      )}
    </button>
  );
}

export function NoteRow({ icon, children, action, plain, tone }: { icon?: ReactNode; children: ReactNode; action?: ReactNode; plain?: boolean; tone?: 'ok' }) {
  return (
    <div className={`si-note${plain ? ' si-note--plain' : ''}${tone === 'ok' ? ' si-note--ok' : ''}`}>
      {icon}
      <div className="si-note__body">
        {children}
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

export function Banner({
  tone,
  icon,
  children,
  action,
  role,
  bannerRef,
}: {
  tone?: 'error' | 'ok';
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  role?: 'status' | 'alert';
  bannerRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={bannerRef} tabIndex={-1} className={`si-banner${tone ? ` si-banner--${tone}` : ''}`} role={role}>
      {icon}
      <div className="si-banner__body">
        {children}
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

export function Collapse({ open, children, id }: { open: boolean; children: ReactNode; id?: string }) {
  return (
    <div className="si-collapse" data-open={open ? 'true' : 'false'} id={id} inert={!open}>
      <div>{children}</div>
    </div>
  );
}

export interface TimelineRow {
  lead: ReactNode;
  line?: ReactNode;
  state?: 'done' | 'next';
  n?: number;
}

export function Timeline({ rows, numbered }: { rows: TimelineRow[]; numbered?: boolean }) {
  return (
    <ol className="si-timeline">
      {rows.map((r, i) => (
        <li className="si-timeline__row" key={i}>
          {numbered ? (
            <span className={`si-timeline__num${r.state === 'done' ? ' si-timeline__num--done' : ''}`} aria-hidden="true">
              {r.n ?? i + 1}
            </span>
          ) : (
            <span className={`si-timeline__dot${r.state === 'done' ? ' si-timeline__dot--done' : ''}`} aria-hidden="true" />
          )}
          <div>
            <p className="si-timeline__lead">
              {r.state === 'done' ? <span className="si-sr">Done: </span> : null}
              {r.lead}
            </p>
            {r.line ? <p className="si-timeline__line">{r.line}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="si-error" id={id}>
      <CircleAlert size={14} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  tag,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  tag?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="si-field">
      <label className="si-label" htmlFor={id}>
        {label}
        {tag}
      </label>
      {children}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : hint ? <p className="si-help" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; end?: ReactNode; mono?: boolean }>(
  function TextInput({ invalid, end, mono, className, ...rest }, ref) {
    return (
      <div className="si-input-wrap">
        <input
          ref={ref}
          {...rest}
          aria-invalid={invalid ? 'true' : undefined}
          className={`si-input${end ? ' si-input--has-end' : ''}${mono ? ' si-input--mono' : ''}${className ? ` ${className}` : ''}`}
        />
        {end}
      </div>
    );
  },
);

export const EuroInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { compact?: boolean; suffix?: string; invalid?: boolean }
>(function EuroInput({ compact, suffix, invalid, ...rest }, ref) {
  return (
    <div className={`si-euro${compact ? ' si-euro--compact' : ''}`} data-invalid={invalid ? 'true' : undefined}>
      <span className="si-euro__sign" aria-hidden="true">
        €
      </span>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="go"
        {...rest}
        aria-invalid={invalid ? 'true' : undefined}
      />
      {suffix ? (
        <span className="si-euro__suffix" aria-hidden="true">
          {suffix}
        </span>
      ) : null}
    </div>
  );
});

export function Segmented<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  tall,
}: {
  name: string;
  legend: string;
  options: { value: T; label: ReactNode; ariaLabel?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  tall?: boolean;
}) {
  return (
    <fieldset className={`si-switch${tall ? ' si-switch--tall' : ''}`}>
      <legend className="si-sr">{legend}</legend>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            aria-label={o.ariaLabel}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

/** Parse a typed euro amount: "150", "€150", "1,200", "150.50". */
export function parseEuro(v: string): number | null {
  const s = v.replace(/[€\s,]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}
