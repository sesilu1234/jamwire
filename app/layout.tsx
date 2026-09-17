import { Metadata } from 'next'; // Add this import
import './globals.css';
import SessionWrapper from './SessionWrapper';
import { ThemeProvider } from './ThemeProvider';
import { getServerSession } from "next-auth"; // Add this
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // P
import Script from 'next/script';
import CookieConsent from './cookieToaster';
import { Toaster } from '@/components/ui/sonner';
import { BRAND } from '@/lib/brand';

// ADD THIS BLOCK
export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description:
    'Discover local jam sessions and open mics. Play, watch, hang out, or just meet people.',
  openGraph: {
    title: BRAND.name,
    description:
      'Find jam sessions and open mics. Play, watch, or just hang out.',
    url: BRAND.siteUrl,
    siteName: BRAND.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.name,
    description: 'Jam sessions, open mics, and bars where people hang out.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className="antialiased min-h-screen bg-tone-5 text-tone-0">
        {/* --- GOOGLE ANALYTICS --- */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NWT7WMH7SP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-NWT7WMH7SP');
          `}
        </Script>
        {/* ------------------------ */}
        <ThemeProvider defaultTheme="dark">
          <SessionWrapper session={session}>{children}</SessionWrapper>
          <CookieConsent/>
          <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
