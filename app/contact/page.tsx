'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { MAX_MESSAGE_LENGTH, contactSchema } from '@/lib/contact';
import { ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';
import SignInIcons from '@/components/map/SingInIcons';
import { BRAND } from '@/lib/brand';


/**
 * Field styling is written out here rather than left to the shadcn defaults.
 * The stock Input/Textarea colour themselves with `--input` and
 * `--muted-foreground`, and globals.css defines both as near-white in EVERY
 * theme block including `.dark` — only the tone-* scale is actually themed.
 * The result on a dark page is a white box with grey text in it.
 *
 * Elevation comes from `surface-raised` / `surface-inset` rather than a step on
 * the tone scale, because tone-5 is the page on every theme and a panel painted
 * in tone-6 ends up DARKER than the page on all five dark palettes.
 */
const FIELD_CLASS =
  'bg-surface-inset text-tone-0 placeholder:text-tone-0/35 ' +
  'border border-tone-0/10 shadow-none transition-colors ' +
  'hover:border-tone-0/20 ' +
  'focus-visible:border-brand focus-visible:ring-brand/25 focus-visible:ring-[3px] ' +
  'aria-invalid:border-danger aria-invalid:ring-danger/20';

type FieldErrors = { email?: string; msg?: string };

export default function Contact() {
  const router = useRouter();
  const emailId = useId();
  const msgId = useId();

  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const remaining = MAX_MESSAGE_LENGTH - msg.length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSending || sent) return;

    const result = contactSchema.safeParse({ email, msg });
    if (!result.success) {
      // Validation lands under the field it belongs to; toasts are kept for
      // things the user can't see inline (network, server).
      const flat = z.flattenError(result.error).fieldErrors;
      setErrors({ email: flat.email?.[0], msg: flat.msg?.[0] });
      return;
    }
    setErrors({});

    setIsSending(true);
    try {
      const res = await fetch('/api/public/users-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      // The old version assumed success and redirected even on a 400/500, so a
      // rejected message looked sent. Check the status and let people retry.
      if (!res.ok) {
        toast.error("That didn't go through", {
          description: 'Try again in a moment.',
        });
        return;
      }

      setSent(true);
      toast.success('Message sent');
      setTimeout(() => router.push('/'), 2000);
    } catch {
      toast.error("Couldn't reach the server", {
        description: 'Check your connection and try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-tone-5 text-tone-0">
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
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

        <h1 className="mt-16 text-3xl font-medium tracking-tight">Contact</h1>
        <p className="mt-2 text-tone-0/55">
          A jam that&apos;s missing, details that are wrong, or something
          broken. Send it here.
        </p>

        {/* Brand rule — the one bit of colour on the page, tying it to the
            wordmark above without decorating anything. */}
        <div className="mt-8 h-px w-12 bg-brand" />

        {/* The panel. Lifted off the page with a long, soft shadow rather than
            a heavy border: the elevation is what encloses the form, the
            1px tone-0/10 edge only keeps it from bleeding into the page. */}
        <div className="mt-8 rounded-xl border border-tone-0/10 bg-surface-raised p-6 shadow-2xl shadow-black/25 sm:p-8">
          {sent ? (
            <div className="flex items-start gap-3 py-6">
              <Check className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <p className="font-medium">Message sent</p>
                <p className="mt-1 text-sm text-tone-0/55">
                  Thanks. Taking you back to the map.
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-block text-sm text-tone-0/60 underline underline-offset-4 hover:text-tone-0"
                >
                  Go now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-7">
              <div className="space-y-2">
                <Label htmlFor={emailId} className="text-sm text-tone-0/80">
                  Email
                </Label>
                <Input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  disabled={isSending}
                  aria-invalid={!!errors.email}
                  aria-describedby={`${emailId}-hint`}
                  className={`h-11 rounded-lg ${FIELD_CLASS}`}
                />
                <p
                  id={`${emailId}-hint`}
                  className={
                    errors.email
                      ? 'text-xs text-danger'
                      : 'text-xs text-tone-0/45'
                  }
                >
                  {errors.email ?? 'Only used to reply to you.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor={msgId} className="text-sm text-tone-0/80">
                    Message
                  </Label>
                  {/* Only worth showing once it's actually a constraint. */}
                  {remaining <= 40 && (
                    <span
                      className={`text-xs tabular-nums ${
                        remaining < 0 ? 'text-danger' : 'text-tone-0/45'
                      }`}
                    >
                      {remaining} left
                    </span>
                  )}
                </div>
                <Textarea
                  id={msgId}
                  rows={6}
                  placeholder="Tuesday jam at The Blue Room, 9pm, house drummer."
                  value={msg}
                  onChange={(e) => {
                    setMsg(e.target.value);
                    if (errors.msg)
                      setErrors((prev) => ({ ...prev, msg: undefined }));
                  }}
                  disabled={isSending}
                  aria-invalid={!!errors.msg || remaining < 0}
                  className={`min-h-36 resize-none rounded-lg py-3 ${FIELD_CLASS}`}
                />
                {errors.msg && (
                  <p className="text-xs text-danger">{errors.msg}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSending}
                className="group h-11 w-full rounded-lg bg-brand font-semibold text-brand-ink hover:bg-brand/85 hover:text-brand-ink"
              >
                {isSending ? 'Sending' : 'Send'}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
