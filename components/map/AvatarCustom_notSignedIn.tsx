
'use client';

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { LogIn, Mail, Menu, User } from "lucide-react";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

type AvatarCustomProps = {
	session: Session | null;
};

function AvatarCustom({ session }: AvatarCustomProps) {
	return (
		<div className="w-16 h-16 flex items-center justify-center">
			<Avatar className="w-16 h-16">
				<AvatarImage
					src={session?.user?.image ?? ""}
					alt="User avatar"
					className="rounded-full object-cover"
				/>
				<AvatarFallback className="bg-black/90 text-white">
					<User className="w-6 h-6" />
				</AvatarFallback>
			</Avatar>
		</div>
	);
}

import { useState, useRef } from "react";
import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { contactSchema } from '@/lib/contact';




export default function DropdownMenuNotSignedIn() {
	const [showNewDialog, setShowNewDialog] = useState(false);
	const [showShareDialog, setShowShareDialog] = useState(false);




	 


  const sendData = async (email: string, msg: string) => {
  // Returns the response so the caller can tell a 400/500 from a success.
  // It used to ignore the result entirely and always report "Message sent".
  const res = await fetch('/api/public/users-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, msg }),
  });
  if (!res.ok) throw new Error(`send failed: ${res.status}`);
};

const [email, setEmail] = useState('');
const [message, setMessage] = useState('');

const [isSending, setIsSending] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (isSending) return;

  const result = contactSchema.safeParse({
    email,
    msg: message,
  });

  if (!result.success) {
    toast.error(result.error.issues[0].message);
    return;
  }

  setIsSending(true);

  try {
    await sendData(result.data.email, result.data.msg);

    setShowShareDialog(false);

    toast.success('Message sent', {
      description: 'Thank you for helping the community stay updated.',
    });
  } catch {
    toast.error("That didn't go through", {
      description: 'Try again in a moment.',
    });
  } finally {
    setIsSending(false);
  }
};

	return (
		<div>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						aria-label="Menu"
						className="inline-flex h-12 w-12 cursor-pointer items-center justify-center
						           rounded border border-transparent bg-transparent text-tone-1/80
						           transition-colors select-none
						           hover:bg-tone-0/8 hover:text-tone-0
						           data-[state=open]:bg-tone-0/10 data-[state=open]:text-tone-0
						           focus-visible:ring-2 focus-visible:ring-tone-0/25 focus-visible:outline-none"
					>
						<Menu className="size-6 shrink-0" strokeWidth={1.75} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-56 z-[500] bg-surface-raised/75 backdrop-blur-xl backdrop-saturate-150 shadow-xl shadow-black/20"
					align="end"
					sideOffset={8}
				>
					<DropdownMenuLabel>Account</DropdownMenuLabel>
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link href="/signIn">
								<LogIn />
								Sign in
							</Link>
						</DropdownMenuItem>

					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuLabel>Settings</DropdownMenuLabel>
					<DropdownMenuGroup>
						<div className="px-0 py-0">
							<AccordionTheme />
						</div>
						<div className="px-0 py-0">
							<AccordionLanguage />
						</div>
						<DropdownMenuItem onSelect={() => setShowShareDialog(true)}>
							<Mail />
							Contact
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="z-[1000] border border-tone-0/15 bg-surface-raised text-tone-0 sm:max-w-[440px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Contact the developer</DialogTitle>
              <DialogDescription className="text-tone-0/60">
                Questions, feedback, or something wrong on the map.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="gap-5 py-5">
              <Field>
                <Label htmlFor="contact-email" className="text-tone-0/80">
                  Email
                </Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="border-tone-0/15 bg-surface-inset text-tone-0 placeholder:text-tone-0/35"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="contact-message" className="text-tone-0/80">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what happened."
                  className="min-h-28 resize-none border-tone-0/15 bg-surface-inset text-tone-0 placeholder:text-tone-0/35"
                  required
                />
              </Field>
            </FieldGroup>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant={null}
                  className="bg-tone-0/10 text-tone-0/70 hover:bg-tone-0/15 hover:text-tone-0"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSending}
                className="bg-brand px-6 font-semibold text-brand-ink hover:bg-brand/85 hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? 'Sending' : 'Send'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
		</div>
	);
}

import { Sun, Moon, Coffee, Droplet, Leaf, Rocket } from "lucide-react";
import { useTheme } from '@/app/ThemeProvider';

export function AccordionTheme() {
	const { theme, setTheme } = useTheme(); // use context

	const themes = ["light", "dark", "tangerine", "ocean", "forest"] as const;

	const icons = [Sun, Moon, Coffee, Droplet, Leaf, Rocket];

	const iconColors: Record<typeof themes[number], string> = {
		light: "text-yellow-400",
		dark: "text-purple-400",
		tangerine: "text-orange-400",
		ocean: "text-blue-400",
		forest: "text-green-500",
	};

	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="theme">
				<AccordionTrigger>Theme Mode</AccordionTrigger>
				<AccordionContent className="flex flex-col gap-2 py-2">
					{themes.map((t, i) => {
						const Icon = icons[i];
						return (
							<button
								key={t}
								onClick={() => setTheme(t)}
								className={`flex items-center gap-2 px-4 py-1 text-left rounded-md ${
									theme === t ? "font-bold" : "hover:bg-tone-0/8"
								}`}
							>
								<Icon
									className={`w-4 h-4 ${
										theme === t ? iconColors[t] : "text-tone-0/40"
									}`}
								/>
								{t.charAt(0).toUpperCase() + t.slice(1)}
							</button>
						);
					})}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

export function AccordionLanguage() {
	const [language, setLanguage] = useState<"en" | "es">("en");

	return (
		<Accordion
			type="single"
			collapsible
			className="w-full"
			defaultValue={undefined}
		>
			<AccordionItem value="item-1">
				<AccordionTrigger>Language</AccordionTrigger>
				<AccordionContent className="flex flex-col gap-2 py-2">
					<button
						className={`px-4 py-1 text-left ${
							language === "en" ? "font-bold" : ""
						}`}
						onClick={() => setLanguage("en")}
					>
						English
					</button>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
