import { BRAND } from '@/lib/brand';

/** The site logo. To change it everywhere, replace public/jamwire_icon.png. */
export default function BrandLogo({ className }: { className?: string }) {
  return <img src={BRAND.logo} alt={BRAND.logoAlt} className={className} />;
}
