'use client';

import { Button } from '@/components/ui/button';
import { useState, useRef  } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useRouter } from 'next/navigation'; 
import { z } from 'zod';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
const MAX_MESSAGE_LENGTH = 500;



export default function Contact() {

  const router = useRouter();


  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState('');

    const sentRef = useRef(false);




  

const contactSchema = z.object({
  email: z
    .email('Invalid email format')
    .max(254),
  msg: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(MAX_MESSAGE_LENGTH, `Message must be under ${MAX_MESSAGE_LENGTH} characters`),
});


 const sendData = async () => {
  if (sentRef.current) return;

  const result = contactSchema.safeParse({ email, msg });

  if (!result.success) {
    toast.error(result.error.issues[0].message);
    return;
  }

  sentRef.current = true;

  await fetch('/api/public/users-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data),
  });

  toast.success('Report sent', {
    description: 'Thank you for helping the community stay updated.',
  });

  setTimeout(() => {
  router.push('/');
}, 3000); // 2 seconds feels natural
};

  return (
    <div className="w-[1300px] max-w-[90%] mx-auto p-6">
      <div className="inline-block w-full">
        <Link href="/" className='flex justify-center'>
          <div className="ml-0 flex gap-2 items-end">
            <BrandLogo className="max-h-16 max-w-75 w-auto h-auto object-contain" />
           <p className="hidden [@media(min-width:385px)]:block text-xs py-3 text-gray-600 font-semibold">
              {BRAND.tagline}
            </p>
          </div>
        </Link>
      </div>
      <div className="flex flex-col items-center gap-6 mt-6">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>
          <p>This is the Contact page.</p>
        </div>

        <div className=" flex flex-col space-y-4 my-8 w-[80vw] max-w-144">
          <div className="flex justify-between ">
            <Button
              className="self-start hover:opacity-90 hover:cursor-pointer hover:text-tone-1 hover:border-tone-0   bg-tone-3 hover:bg-tone-3/70"
             
              onClick={sendData}
            >
              Submit
            </Button>
          </div>

          <textarea
            className=" h-64 p-8 border bg-white text-black border-gray-400 rounded resize-none"
            placeholder="Write your message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter your email"
            className="w-6/8  px-2 py-2 rounded-sm border bg-white text-black border-gray-400 focus:ring-1 focus:ring-gray-200 outline-none text-md leading-tight"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
