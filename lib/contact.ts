import { z } from 'zod';

/**
 * Single source of truth for the contact / suggestion form.
 *
 * There were previously five copies of this schema — the contact page and the
 * four avatar dialogs — with three different limits between them, and the API
 * route had a fourth. The client allowed 500 characters while the route
 * rejected anything over 150, so a medium-length message was refused by the
 * server while the UI reported it as sent. Both sides import this now, so the
 * limits cannot drift apart again.
 *
 * NOTE: if `user_suggestions.message` in Supabase is a fixed-width column
 * narrower than MAX_MESSAGE_LENGTH, raising this number moves the failure from
 * the schema to the insert. The column should be `text`.
 */
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_EMAIL_LENGTH = 254;

export const contactSchema = z.object({
  email: z
    .email('That email address looks off')
    .max(MAX_EMAIL_LENGTH, 'That email address is too long'),
  msg: z
    .string()
    .trim()
    .min(1, 'Write a message first')
    .max(
      MAX_MESSAGE_LENGTH,
      `Message must be under ${MAX_MESSAGE_LENGTH} characters`,
    ),
});

export type ContactInput = z.infer<typeof contactSchema>;
