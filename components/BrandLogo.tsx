import { BRAND } from '@/lib/brand';

/**
 * The site logo. To change it everywhere, replace public/jamwire_icon.png.
 *
 * `mark` swaps the wide wordmark for the square mark (public/icon.png). Use it
 * where there is no room for the wordmark — the phone top bar, for instance.
 */
export default function BrandLogo({
  className,
  mark = false,
}: {
  className?: string;
  mark?: boolean;
}) {
  return (
    <img
      src={mark ? BRAND.logoMark : BRAND.logo}
      alt={mark ? BRAND.logoMarkAlt : BRAND.logoAlt}
      className={className}
    />
  );
}
