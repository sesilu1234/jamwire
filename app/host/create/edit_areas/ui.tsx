'use client';

/**
 * Small presentational primitives shared by the /host/create sections.
 * Purely visual — no state, no data handling.
 */

import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  flat = false,
}: {
  className?: string;
  children: React.ReactNode;
  /**
   * Drops the border, background and shadow, leaving the section separated by
   * whitespace alone. Boxing every group makes a long form look heavier than it
   * is; the headings already tell you where one section ends.
   */
  flat?: boolean;
}) {
  return (
    <section
      className={cn(
        flat
          ? 'px-0 py-1'
          : 'rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_8px_24px_-16px_rgba(24,24,27,0.12)] sm:p-6',
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

/**
 * Popover skin for Select menus on this route.
 *
 * The /host form is a hard-coded light surface, but Select colours its popover
 * from --popover / --accent, which follow the app theme. On a dark theme that
 * produced a grey panel on a white form, and — worse — `focus:text-accent-
 * foreground` turned the hovered option near-white, so the row you were
 * pointing at became invisible. Pinning all of it to the form's own palette.
 */
export const selectPopoverSkin =
  'border-zinc-200 bg-white text-zinc-900 shadow-lg ring-1 ring-zinc-900/5 ' +
  '[&_[data-slot=select-label]]:text-zinc-500 ' +
  '[&_[data-slot=select-item]]:text-zinc-800 ' +
  '[&_[data-slot=select-item]:focus]:bg-zinc-100 ' +
  '[&_[data-slot=select-item]:focus]:text-zinc-900';
