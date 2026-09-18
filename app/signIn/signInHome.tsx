'use client';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';

export default function SignIn() {
  const searchParams = useSearchParams();

  // Get the 'callbackUrl' from the URL, or default to home if it's missing
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    /* 1. Changed bg-white/85 to bg-white: Stops the phone's dark background from bleeding through.
       2. added dark:bg-white: This forces the background to stay white even if the phone is in dark mode.
    */
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-20">
          <Link href="/" aria-label={BRAND.name} className="inline-block">
            <BrandLogo className="h-9 w-auto object-contain" />
          </Link>
          <p className="text-xs pb-1 text-gray-600 font-semibold uppercase tracking-wider">
            {BRAND.tagline}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h2 className="font-extrabold text-4xl md:text-6xl tracking-tighter">
              WELCOME TO {BRAND.nameUpper}
            </h2>
            <p className="mt-4 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Browsing is free and always will be. An account is only for adding
              a jam to the map, commenting, upvoting and reporting wrong details.
            </p>
          </div>

          {/* Divider - using max-w instead of fixed pixels */}
          <div className="h-[1px] bg-black/10 w-full max-w-md mx-auto"></div>

          {/* Navigation Sub-header */}
          <div className="flex w-full max-w-md justify-between items-center mt-6 px-1">
            <Link 
              href="/" 
              className="flex gap-2 items-center font-bold text-sm hover:opacity-60 transition-opacity"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.40527 12.65H23V10.35H4.40527L13.1395 1.61575L11.5 0L0 11.5L11.5 23L13.1395 21.3842L4.40527 12.65Z"
                  fill="currentColor"
                />
              </svg>
              BACK TO HOME
            </Link>
            <span className="font-bold text-sm text-gray-400">SIGN IN</span>
          </div>

          {/* Google Button - Changed to a <button> for better mobile behavior */}
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="group mt-16 flex items-center justify-center gap-4 w-full max-w-xs px-6 py-4 
                       bg-white border-2 border-black rounded-2xl font-bold text-lg
                       shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                       transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                       hover:bg-gray-200 select-none
                       hover:cursor-pointer
                       "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.7574 24.9988C10.7574 23.411 11.0211 21.8888 11.4917 20.461L3.25339 14.1699C1.64778 17.4299 0.743164 21.1033 0.743164 24.9988C0.743164 28.891 1.64667 32.5621 3.25005 35.8199L11.484 29.5166C11.0177 28.0955 10.7574 26.5788 10.7574 24.9988Z"
                fill="#FBBC05"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25.2219 10.5547C28.6712 10.5547 31.7867 11.7769 34.2347 13.7769L41.3559 6.6658C37.0164 2.88802 31.4529 0.554688 25.2219 0.554688C15.5481 0.554688 7.23413 6.08691 3.25293 14.1702L11.4913 20.4614C13.3895 14.6991 18.8005 10.5547 25.2219 10.5547Z"
                fill="#EB4335"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25.2219 39.4438C18.8005 39.4438 13.3895 35.2993 11.4913 29.5371L3.25293 35.8271C7.23413 43.9116 15.5481 49.4438 25.2219 49.4438C31.1926 49.4438 36.8929 47.3238 41.1712 43.3516L33.3512 37.306C31.1447 38.696 28.3663 39.4438 25.2219 39.4438Z"
                fill="#34A853"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.5891 24.9991C48.5891 23.5547 48.3666 21.9991 48.0328 20.5547H25.2227V29.9991H38.3524C37.6959 33.2191 35.9089 35.6947 33.352 37.3058L41.1719 43.3514C45.6661 39.1802 48.5891 32.9669 48.5891 24.9991Z"
                fill="#4285F4"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 max-w-xs text-center text-xs leading-relaxed text-gray-500">
            We only use your email to sign you in. We don&apos;t sell it and we
            don&apos;t send marketing —{' '}
            <Link href="/privacy" className="underline hover:text-black">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}