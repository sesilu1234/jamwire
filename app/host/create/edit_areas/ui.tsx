'use client';

/**
 * Small presentational primitives shared by the /host/create sections.
 * Purely visual — no state, no data handling.
 */

import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_8px_24px_-16px_rgba(24,24,27,0.12)] sm:p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
          {title}
        </h3>
        {hint ? (
          <p className="mt-1 text-[13px] leading-snug text-zinc-500">{hint}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function FieldLabel({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500',
        className,
      )}
    >
      {children}
    </label>
  );
}

/** Shared input skin so every text field on this route looks the same. */
export const inputSkin =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2.5 text-[14px] text-zinc-900 ' +
  'placeholder:text-zinc-400 shadow-none outline-none transition-all duration-200 ' +
  'hover:border-zinc-300 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';
