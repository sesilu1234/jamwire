import { authOptions } from '../api/auth/[...nextauth]/route'; // adjust relative path
import { getServerSession } from 'next-auth/next';

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import JamSessionList from './jamSessionList';
import { BRAND } from '@/lib/brand';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/signIn');

  return (
    <div className="min-h-screen bg-white/85 text-black ">
      <div className="w-[1300px] max-w-[90%] mx-auto pt-12 pb-128">
        <div className="flex justify-between  p">
          <div className="flex flex-col relative ml-3 flex  items-center gap-2">
            <h3 className="font-bold text-5xl">{BRAND.nameLower}</h3>
            <p className="text-xs pt- text-gray-800 font-semibold"></p>
          </div>

          <div className="w-16 h-16 ">
            <Avatar>
              <AvatarImage
                src={session.user?.image || 'https://github.com/shadcn.png'}
                className="rounded-full"
              />
              <AvatarFallback>
                {session.user?.name ? session.user.name[0] : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="flex flex-col gap-8 mt-4 ml-3">
          <Link href="/">
            <div className="flex gap-4 items-center font-semibold cursor-pointer">
              <svg
                width="16"
                height="16"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.40527 12.65H23V10.35H4.40527L13.1395 1.61575L11.5 0L0 11.5L11.5 23L13.1395 21.3842L4.40527 12.65Z"
                  fill="#1F1F1F"
                />
              </svg>
              <h1 className="text-sm hover:underline">Back to home page</h1>
            </div>
          </Link>

     <div className="flex items-center gap-3 px-4 py-2.5 mx-auto w-fit border border-white/10 bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:bg-zinc-900">
  
  {/* Ultra-Slow Status Indicator */}
  <div className="relative flex h-2 w-2 items-center justify-center">
    {/* The Ping (Slowed down to 3 seconds) */}
    <span 
      className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40 animate-ping"
      style={{ animationDuration: '5s' }} 
    />
    {/* The Core Dot */}
    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
  </div>

  <h3 className="text-sm font-medium text-zinc-400 tracking-tight">
    Welcome back, <span className="text-zinc-100 font-bold ml-1">{session.user?.display_name}</span>
  </h3>
</div>
          <h3 className="font-bold text-3xl ml-6 md:ml-24 mt-4">Your jams</h3>
        </div>

        <JamSessionList />
      </div>
    </div>
  );
}
