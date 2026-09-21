'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Coffee, Droplet, Leaf, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/ThemeProvider';

/**
 * The rows shared by the signed-in and signed-out account menus.
 *
 * They lived twice, once in each menu, as two accordions that had drifted
 * apart. Both hid their current value behind a click: you could not tell
 * which theme was active without opening the accordion that would change it.
 */

/**
 * The five the app has always offered. `slate` also exists in globals.css and
 * in the ThemeProvider union, but it reads as a near-duplicate of `dark` in
 * the picker, so it stays unlisted — as it was before.
 */
const THEMES = [
  { id: 'light', Icon: Sun, color: 'text-yellow-400', label: 'Light' },
  { id: 'dark', Icon: Moon, color: 'text-purple-400', label: 'Dark' },
  {
    id: 'tangerine',
    Icon: Coffee,
    color: 'text-orange-400',
    label: 'Tangerine',
  },
  { id: 'ocean', Icon: Droplet, color: 'text-blue-400', label: 'Ocean' },
  { id: 'forest', Icon: Leaf, color: 'text-green-500', label: 'Forest' },
] as const;

/**
 * Segmented control: the active theme is visible without opening anything,
 * and changing it is one tap rather than open-scan-tap.
 */
export function ThemeSegmented() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <span className="text-sm text-tone-0/70">Theme</span>

      <div
        role="radiogroup"
        aria-label="Theme"
        className="flex items-center gap-0.5 rounded-lg bg-tone-0/8 p-0.5"
      >
        {THEMES.map(({ id, Icon, color, label }) => {
          const active = theme === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              title={label}
              onClick={() => setTheme(id)}
              className={`flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors ${
                active ? 'bg-surface-raised shadow-sm' : 'hover:bg-tone-0/10'
              }`}
            >
              <Icon
                className={`size-3.5 ${active ? color : 'text-tone-0/40'}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Shows the current language rather than hiding it behind a disclosure.
 *
 * No chevron and nothing to click: English is the only language the app has,
 * and the old accordion's `setLanguage` wrote to local state that nothing
 * read. Give this a real control when there is a second language to pick.
 */
export function LanguageRow() {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <span className="text-sm text-tone-0/70">Language</span>
      <span className="text-sm font-medium text-tone-0">English</span>
    </div>
  );
}

const LINKS = [
  { href: '/help', label: 'Help' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/contact', label: 'Contact' },
];

/**
 * The secondary pages as one quiet row.
 *
 * Contact is a link now. It used to open a dialog holding a duplicate of the
 * form already at /contact, which is where this sends you instead — that
 * dialog and its submit handler are gone from both menus.
 *
 * Privacy matters most here: the site footer is its only other route, and the
 * map hides the footer below md, so on a phone the policy could not be
 * reached from the map at all.
 */
export function AccountLinks() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 py-2 text-xs text-tone-0/55">
      {LINKS.map(({ href, label }, i) => (
        <Fragment key={href}>
          {i > 0 && <span className="text-tone-0/20">·</span>}
          <Link href={href} className="transition-colors hover:text-tone-0">
            {label}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
