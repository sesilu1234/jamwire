'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThumbsUp, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface UpvoteReportProps {
  jamId: string;
}

export default function UpvoteReport({ jamId }: UpvoteReportProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();

  const [isUpvoted, setIsUpvoted] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const [upvoteCount, SetUpvoteCount] = useState(0);

  useEffect(() => {
    // 1. Define the async function
    const fetchLikes = async () => {
      try {
        const response = await fetch(`/api/public/get-likes-jam/${jamId}`);
        const data = await response.json();

        setIsUpvoted(data.hasLiked);

        if (data.hasLiked) {
          SetUpvoteCount(data.count - 1);
        } else {
          SetUpvoteCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch likes:', error);
      } finally {
      }
    };

    fetchLikes();
  }, [jamId]);

  type JamAction = 'upvote' | 'report a jam';

  const ensureAuth = (actionName: JamAction) => {
    if (!session) {
      toast('Login required', {
        description: `You need to be logged in to ${actionName}.`,

        action: {
          label: 'Login',
          onClick: () =>
            router.push(`/signIn?callbackUrl=${encodeURIComponent(pathname)}`),
        },
      });
      return false;
    }
    return true;
  };

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLikeSubmit = (currentStatus: boolean) => {
    // 1. Limpiamos el temporizador previo
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 2. Programamos la ejecución
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/private/jam-like/${jamId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isUpvoted: currentStatus }),
        });

        if (!response.ok) {
          throw new Error('API Error');
        }
      } catch (error) {
        // Revertimos el estado si la API falla
        setIsUpvoted(!currentStatus);
        toast.error('Error', {
          description: 'Could not submit like. Try again.',
        });
      } finally {
        debounceTimer.current = null;
      }
    }, 500);
  };

  const handleReportSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/private/jam-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jam_id: jamId,
          reason,
          description,
        }),
      });

      if (!response.ok) throw new Error('Failed to send');

      toast.success('Report sent', {
        description: 'Thank you for helping the community stay updated.',
      });

      setReportOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      toast.error('Error', {
        description: 'Could not submit report. Try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end justify-end gap-2 lg:ml-auto pt-12 lg:pt-0">
      {/* Upvote Button */}
      <button
        onClick={() => {
          if (ensureAuth('upvote')) {
            const newStatus = !isUpvoted;
            setIsUpvoted(newStatus); // Cambio visual instantáneo (Optimistic UI)
            handleLikeSubmit(newStatus); // Programar el envío
          }
        }}
        className={`flex items-center gap-1.5 group transition-all px-3
          ${isUpvoted ? 'text-emerald-400' : 'text-tone-1 hover:text-emerald-400'}`}
      >
        <div
          className={`p-1.5 rounded-lg transition-colors 
          ${isUpvoted ? 'bg-emerald-500/20' : 'group-hover:bg-emerald-500/10'}`}
        >
          <ThumbsUp
            size={18}
            className={`transition-transform group-active:scale-90 
              ${isUpvoted ? ' fill-emerald-400/30' : 'group-hover:fill-emerald-400/20'}`}
          />
        </div>
        <span className="text-sm font-semibold tabular-nums tracking-tight ">
          {isUpvoted ? upvoteCount + 1 : upvoteCount}
        </span>
      </button>

      {/* Report Button */}
      <button
        onClick={() => {
          if (ensureAuth('report a jam')) {
            setReportOpen(true);
          }
        }}
        className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 text-tone-0 rounded-md text-xs font-medium transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 active:scale-95"
      >
        <span>Report Jam</span>
        <Flag size={14} />
      </button>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-[425px] border border-tone-0/15 bg-surface-raised text-tone-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Report Jam Session
            </DialogTitle>
            <DialogDescription className="text-tone-0/60">
              Help us maintain the map. What is wrong with this jam?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="pl-1 text-sm font-medium text-tone-0/70">
                Reason
              </label>
              <Select onValueChange={setReason} value={reason}>
                <SelectTrigger className="border-tone-0/15 bg-surface-inset text-tone-0">
                  <SelectValue placeholder="Why are you reporting?" />
                </SelectTrigger>
                <SelectContent className="border-tone-0/15 bg-surface-raised text-tone-0">
                  <SelectItem value="closed">
                    Jam is closed / doesn´t exist
                  </SelectItem>
                  <SelectItem value="inappropriate">
                    Inappropriate content
                  </SelectItem>
                  <SelectItem value="wrong_info">
                    Wrong location or time
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="pl-1 text-sm font-medium text-tone-0/70">
                Extra Details
              </label>
              <Textarea
                placeholder="Optional description..."
                className="h-24 resize-none border border-tone-0/15 bg-surface-inset text-tone-0 placeholder:text-tone-0/40"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant={null}
              onClick={() => setReportOpen(false)}
              className="bg-tone-0/10 text-tone-0/70 hover:bg-tone-0/15 hover:text-tone-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={isSubmitting || !reason}
              className="bg-danger px-6 text-white hover:bg-danger/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
