import Link from 'next/link';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';
import SignInIcons from '@/components/map/SingInIcons';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `What ${BRAND.name} collects, what it doesn't, and how to get content removed.`,
};

/**
 * Numbering lives in the data, not in the headings, so inserting a clause
 * doesn't mean renumbering the ones after it by hand.
 */
const SECTIONS = [
  {
    title: 'Information we collect',
    body: `${BRAND.name} is an informational platform. You don't need an account to browse. If you contact us by email, your address is used to reply to you and nothing else.`,
  },
  {
    title: 'Cookies and tracking',
    body: 'We use basic analytics cookies to understand how the site is used. If ads are shown, third-party vendors including Google may use cookies to serve them based on your prior visits.',
  },
  {
    title: 'Third-party links and content',
    body: 'The site contains images and links to external platforms such as Instagram. We are not responsible for the privacy practices or the content of those sites.',
  },
  {
    title: 'Contact',
    body: 'For questions about this policy, or to request that content be removed, get in touch and we will deal with it.',
  },
];

export default function PrivacyPage() {
  const updated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen flex-col bg-tone-5 text-tone-0">
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
        {/* The logo alone used to be the whole header. On a phone the map's
            tab bar is the only account menu in the app, and it does not
            follow you here — so theme and sign out were unreachable from any
            content page. Same pair as the map header, same component. */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-block" aria-label={BRAND.name}>
            <BrandLogo className="h-9 w-auto object-contain" />
          </Link>

          <SignInIcons />
        </div>

        <h1 className="mt-16 text-3xl font-medium tracking-tight">Privacy</h1>
        <p className="mt-2 text-tone-0/55">
          The short version: we collect almost nothing, and we don&apos;t sell
          any of it.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-px w-12 bg-brand" />
          <span className="text-xs text-tone-0/40">Updated {updated}</span>
        </div>

        <dl className="mt-12 divide-y divide-tone-0/10 border-t border-tone-0/10">
          {SECTIONS.map((section, i) => (
            <div key={section.title} className="flex gap-5 py-6">
              <span className="mt-0.5 shrink-0 text-xs tabular-nums text-tone-0/30">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <dt className="font-medium">{section.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-tone-0/60">
                  {section.body}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <p className="mt-12 text-sm text-tone-0/50">
          Anything here unclear, or want something taken down?{' '}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-tone-0/80"
          >
            Get in touch
          </Link>
          .
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
