import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

/**
 * The contact page is a client component, so it can't export metadata itself.
 * This layout exists only to give it a title and description.
 */
export const metadata: Metadata = {
  title: 'Contact',
  description: `Claim a jam session or open mic you host on ${BRAND.name}, report wrong details, or tell us something's broken.`,
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
