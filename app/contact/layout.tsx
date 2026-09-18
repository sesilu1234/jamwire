import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

/**
 * The contact page is a client component, so it can't export metadata itself.
 * This layout exists only to give it a title and description.
 */
export const metadata: Metadata = {
  title: 'Contact',
  description: `Tell us about a jam session or open mic that's missing from ${BRAND.name}, report wrong details, or just say hi.`,
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
