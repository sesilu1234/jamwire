import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

/**
 * The site footer, shared by the map, the city pages and the jam pages.
 *
 * Brand and nav stack on phones and sit side by side from `sm` up, so nothing
 * is pushed off-screen on a narrow viewport.
 *
 * `className` exists because the map and city pages hide the footer on phones
 * (they show a tab bar instead) while jam pages always show it.
 */
export default function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('w-full pt-4 pb-12', className)}>
      <div className="mx-auto w-full max-w-[1300px] px-6">
        <div className="border-t-2 border-primary-1 pt-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3">
              <Link href="/" aria-label={BRAND.name} className="inline-block">
                <BrandLogo className="h-9 w-auto max-w-full object-contain sm:h-11" />
              </Link>
              <p className="max-w-xs text-sm text-tone-1/70">{BRAND.tagline}</p>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium tracking-wide text-tone-1/95">
              <Link href="/contact" className="hover:text-tone-0">
                CONTACT
              </Link>
              <Link href="/help" className="hover:text-tone-0">
                HELP
              </Link>
              <Link href="/about" className="hover:text-tone-0">
                ABOUT
              </Link>
            </nav>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 border-t border-tone-1/10 pt-6 text-xs text-tone-1/60 sm:flex-row sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()}{' '}
              <span className="font-bold">{BRAND.name}</span>. All rights
              reserved.
            </p>
            <Link href="/privacy" className="hover:text-tone-0 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
