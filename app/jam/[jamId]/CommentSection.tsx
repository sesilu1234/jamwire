'use client';

import { useEffect, useState } from 'react';
import {
  createComment,
  deleteComment,
  restoreComment,
  reportComment,
  editComment,
} from '@/lib/comments/actions'; //
import { Avatar, AvatarSelf } from './Avatar';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useRouter, usePathname } from 'next/navigation';
interface CommentSectionProps {
  jamId: string;
  comments: any;
  host_name: string;
}

import { useSession } from 'next-auth/react';

// 2. Destructure the props correctly
export default function CommentSection({
  jamId,
  comments,
  host_name,
}: CommentSectionProps) {
  const { data: session, status } = useSession();

  const router = useRouter();
  const pathname = usePathname();

  const [replyingTo, setReplyingTo] = useState<null | string>(null);
  const [expandedThreads, setExpandedThreads] = useState<string[]>(
    comments?.[0]?.comment_id ? [comments[0].comment_id] : [],
  );

  interface Reply {
    comment_id: string;
    display_name: string;
    time: string;
    content: string;
    avatar: string;
    deleted_at: boolean | string | null;
    host: boolean;
    is_querying_user: boolean;
  }

  interface Comment extends Reply {
    replies: Reply[]; // Only top-level comments have this
  }

  const initialComments: Comment[] = comments;
  const [commentsState, setCommentsState] = useState<Comment[]>(
    initialComments.map((comment) => ({
      ...comment,
      avatar: '/user_icons/tiger.png',
    })),
  );

  const toggleThread = (id: string) => {
    setExpandedThreads((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id],
    );
  };

  const postMessage = async () => {
    if (!session) {
      toast('Login required', {
        description: `You need to be logged in to post comment.`,

        action: {
          label: 'Login',
          onClick: () =>
            router.push(`/signIn?callbackUrl=${encodeURIComponent(pathname)}`),
        },
      });
      return false;
    }

    if (!message.trim()) return;

    const contentToSave = message;

    // No optimism: wait for the DB to confirm and return the real row.
    setIsPosting(true);
    try {
      const res = await createComment(jamId, contentToSave);

      if (res?.error || !res?.comment?.comment_id) {
        console.error('Post failed:', res?.error);
        toast('Could not post comment', {
          description: 'Please try again in a moment.',
        });
        return;
      }

      const newMessage: Comment = {
        comment_id: res.comment.comment_id, // real UUID from the database
        display_name: session?.user?.display_name || 'You',
        time: 'now',
        content: contentToSave,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        deleted_at: null,
        is_querying_user: true,
        host: session?.user?.display_name === host_name,
        replies: [],
      };

      setCommentsState((prev) => [newMessage, ...prev]);
      setMessage('');
    } catch (error) {
      console.error('Post failed:', error);
      toast('Could not post comment', {
        description: 'Please try again in a moment.',
      });
    } finally {
      setIsPosting(false);
    }
  };

  // 1. Mark as async
  const postReply = async (parentId: string) => {
    // Ensure commentId is a string/UUID

    if (!session) {
      toast('Login required', {
        description: `You need to be logged in to post reply.`,

        action: {
          label: 'Login',
          onClick: () =>
            router.push(`/signIn?callbackUrl=${encodeURIComponent(pathname)}`),
        },
      });
      return false;
    }

    if (!messageReply.trim()) return;

    // Capture the message before clearing the input
    const contentToSave = messageReply;

    // No optimism: wait for the DB to confirm and return the real row.
    setPostingReplyId(parentId);
    try {
      const res = await createComment(jamId, contentToSave, parentId);

      if (res?.error || !res?.comment?.comment_id) {
        console.error('Reply failed:', res?.error);
        toast('Could not post reply', {
          description: 'Please try again in a moment.',
        });
        return;
      }

      const newReply: Reply = {
        comment_id: res.comment.comment_id, // real UUID from the database
        display_name: session?.user?.display_name || 'You',
        time: 'Just now',
        content: contentToSave,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        deleted_at: null,
        host: session?.user?.display_name === host_name,
        is_querying_user: true,
      };

      setCommentsState((prev) =>
        prev.map((comment) =>
          comment.comment_id === parentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment,
        ),
      );

      // Make sure the thread is open so the new reply is visible.
      setExpandedThreads((prev) =>
        prev.includes(parentId) ? prev : [...prev, parentId],
      );

      setMessageReply('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Reply failed:', error);
      toast('Could not post reply', {
        description: 'Please try again in a moment.',
      });
    } finally {
      setPostingReplyId(null);
    }
  };

  const deleteCommentOrReply = async (
    parentId: string,
    replyId: string | null = null,
  ) => {
    const now = new Date().toISOString();

    setCommentsState((prev) =>
      prev.map((comment) => {
        // 1. Handle top-level comment deletion
        if (replyId === null) {
          if (comment.comment_id === parentId) {
            return { ...comment, deleted_at: now };
          }
          return comment;
        }

        // 2. Handle reply deletion inside a specific parent
        if (comment.comment_id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.comment_id === replyId
                ? { ...reply, deleted_at: now }
                : reply,
            ),
          };
        }

        return comment;
      }),
    );

    await deleteComment(replyId ? replyId : parentId, jamId);
  };

  const restoreCommentOrReply = async (
    parentId: string,
    replyId: string | null = null,
  ) => {
    const now = new Date().toISOString();

    setCommentsState((prev) =>
      prev.map((comment) => {
        // 1. Handle top-level comment deletion
        if (replyId === null) {
          if (comment.comment_id === parentId) {
            return { ...comment, deleted_at: null };
          }
          return comment;
        }

        // 2. Handle reply deletion inside a specific parent
        if (comment.comment_id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.comment_id === replyId
                ? { ...reply, deleted_at: null }
                : reply,
            ),
          };
        }

        return comment;
      }),
    );

    await restoreComment(replyId ? replyId : parentId, jamId);
  };

  const reportCommentOrReply = async (
    parentId: string,
    replyId: string | null = null,
  ) => {
    if (!session) {
      toast('Login required', {
        description: `You need to be logged in to report comment.`,

        action: {
          label: 'Login',
          onClick: () =>
            router.push(`/signIn?callbackUrl=${encodeURIComponent(pathname)}`),
        },
      });
      return false;
    }

    await reportComment(replyId ? replyId : parentId, jamId);

    toast('Report Submitted', {
      description: 'We appreciate your feedback!',
      action: {
        label: 'Got it',
        onClick: () => {
          // Optional action when user clicks
        },
      },
    });

    return false;
  };

  const editCommentOrReply = async (
    parentId: string,
    replyId: string | null = null,
  ) => {
    if (!editValue.trim()) return;

    const contentToEdit = editValue;

    setCommentsState((prev) =>
      prev.map((comment) => {
        // 1. Handle top-level comment deletion
        if (replyId === null) {
          if (comment.comment_id === parentId) {
            return { ...comment, content: editValue };
          }
          return comment;
        }

        // 2. Handle reply deletion inside a specific parent
        if (comment.comment_id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.comment_id === replyId
                ? { ...reply, content: editValue }
                : reply,
            ),
          };
        }

        return comment;
      }),
    );
    setEditingId(null);

    await editComment(replyId ? replyId : parentId, contentToEdit, jamId);
  };

  const [message, setMessage] = useState('');
  const [messageReply, setMessageReply] = useState('');

  const [isPosting, setIsPosting] = useState(false);
  const [postingReplyId, setPostingReplyId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  return (
    <div className="w-[1300px] max-w-[95%] mx-auto py-12 px-6   border-t border-white/5 text-tone-0">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">Comments & Questions</h3>
        <p className="text-sm opacity-60">
          Ask about the jam, the setup, or coordinate with other musicians.
        </p>
      </div>

      {/* Main Input Area */}
      <div className="mb-12">
        <div className="flex gap-4 items-start">
          {status === 'loading' ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <AvatarSelf display_name={session?.user?.display_name || null} />
          )}
          <div className="flex-1">
            <div className="relative">
              <textarea
                placeholder="Ask a question or leave a comment..."
                className="w-full bg-tone-0/5 border border-tone-0/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none placeholder:opacity-50 disabled:opacity-60"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isPosting}
              />
              {isPosting && (
                <div className="absolute top-3 right-3">
                  <Spinner />
                </div>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <button
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
                onClick={() => postMessage()}
                disabled={isPosting}
              >
                {isPosting && <Spinner size={14} />}
                {isPosting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {commentsState.map((comment) => (
          <div key={comment.comment_id} className="group/comment ">
            {/* Parent Comment */}
            <div className="relative flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group/commentbox border border-transparent hover:border-white/5">
              {comment.deleted_at ? (
                <div className="w-10 h-10 rounded-full border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0" />
              ) : (
                <Avatar display_name={comment.display_name || null} />
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-purple-400">
                    {comment.deleted_at ? '[deleted]' : comment.display_name}
                  </span>

                  {/* Existing Host Badge */}
                  <div className="hidden sm:flex gap-2">
                    {comment.host && (
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase tracking-wider">
                        Host
                      </span>
                    )}

                    {/* New "You" Badge */}
                    {comment.is_querying_user && (
                      <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 font-bold uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] opacity-40 uppercase tracking-widest">
                    {comment.time}
                  </span>
                </div>

                <div className="text-sm leading-relaxed opacity-90 mb-3 max-w-[80%]">
                  {comment.deleted_at ? (
                    <em className="text-gray-500 italic">
                      [This message was deleted]
                    </em>
                  ) : editingId === comment.comment_id ? (
                    /* EDIT MODE */
                    <div className="flex flex-col gap-2 mt-4">
                      <textarea
                        autoFocus
                        className="w-full bg-white/5 border border-purple-500/50 rounded-lg p-2 text-sm focus:outline-none min-h-[3.5rem] text-[12px]"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] uppercase opacity-50 hover:opacity-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => editCommentOrReply(comment.comment_id)} // For replies, pass parentId too
                          className="text-[10px] uppercase text-amber-500 opacity-80 hover:opacity-100 font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* NORMAL MODE */
                    comment.content
                  )}
                </div>

                <div className="absolute top-2 right-2 z-10 lg:opacity-100 group-hover/commentbox:opacity-100 transition-opacity">
                  <CommentOptions
                    comment={comment}
                    onDelete={() => {
                      deleteCommentOrReply(comment.comment_id);
                    }}
                    isDeleted={!!comment.deleted_at}
                    onRestore={() => restoreCommentOrReply(comment.comment_id)}
                    onReport={() => {
                      reportCommentOrReply(comment.comment_id);
                    }}
                    onEdit={() => {
                      setEditValue(comment.content);
                      setEditingId(comment.comment_id);
                    }}
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => {
                      setMessageReply('');
                      setReplyingTo(
                        replyingTo === comment.comment_id
                          ? null
                          : comment.comment_id,
                      );
                    }}
                    className="text-[11px] font-bold opacity-40 hover:opacity-100 hover:text-purple-400 transition-all uppercase tracking-tighter"
                  >
                    {replyingTo === comment.comment_id ? 'Cancel' : 'Reply'}
                  </button>

                  {comment.replies.length > 0 && (
                    <button
                      onClick={() => toggleThread(comment.comment_id)}
                      className="text-[11px] font-bold opacity-40 hover:opacity-100 transition-all uppercase tracking-tighter"
                    >
                      {expandedThreads.includes(comment.comment_id)
                        ? 'Hide Thread'
                        : `View ${comment.replies.length} Replies`}
                    </button>
                  )}

                  <div className="flex sm:hidden gap-2">
                    {comment.host && (
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase tracking-wider">
                        Host
                      </span>
                    )}

                    {/* New "You" Badge */}
                    {comment.is_querying_user && (
                      <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 font-bold uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Input (The "Dropdown") */}
            {replyingTo === comment.comment_id && (
              <div className="ml-14 mt-2 mb-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {status === 'loading' ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                ) : (
                  <Avatar
                    display_name={session?.user?.display_name || null}
                    size="w-8 h-8 shrink-0"
                  />
                )}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="relative">
                    <input
                      autoFocus
                      placeholder={`Reply to ${comment.display_name}...`}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-purple-500/50 transition-all disabled:opacity-60"
                      value={messageReply}
                      onChange={(e) => setMessageReply(e.target.value)}
                      disabled={postingReplyId === comment.comment_id}
                    />
                    {postingReplyId === comment.comment_id && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <Spinner size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="bg-purple-600/80 hover:bg-purple-600 px-4 py-1.5 rounded-md text-[11px] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                      onClick={() => postReply(comment.comment_id)}
                      disabled={postingReplyId === comment.comment_id}
                    >
                      {postingReplyId === comment.comment_id && (
                        <Spinner size={12} />
                      )}
                      {postingReplyId === comment.comment_id
                        ? 'Posting…'
                        : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Threaded Replies */}
            {expandedThreads.includes(comment.comment_id) &&
              comment.replies.length > 0 && (
                /* Reduced margin-left and padding to save horizontal space */
                <div className="ml-4 sm:ml-16 mt-3 mb-8 space-y-3 border-l border-white/10 pl-4">
                  {comment.replies.map((reply) => (
                    // ADDED: "group/reply" to the className below
                    <div
                      key={reply.comment_id}
                      className="group/reply relative flex gap-2 p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors max-w-[95%]"
                    >
                      {reply.deleted_at ? (
                        <div className="w-6 h-6  rounded-full border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0" />
                      ) : (
                        <Avatar
                          display_name={reply.display_name || null}
                          size="w-6 h-6 shrink-0"
                        />
                      )}

                      <div className="min-w-0 ">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-[10px] text-purple-300/80 truncate">
                            {reply.deleted_at
                              ? '[deleted]'
                              : reply.display_name}
                          </span>

                          <div className="hidden sm:flex gap-2 pb-0.5">
                            {reply.host && (
                              <span className="bg-purple-500/20 text-purple-300 text-[7px] px-1.5 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase tracking-wider">
                                Host
                              </span>
                            )}
                            {reply.is_querying_user && (
                              <span className="bg-blue-500/20 text-blue-300 text-[7px] px-1.5 py-0.5 rounded-full border border-blue-500/30 font-bold uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] opacity-30 uppercase whitespace-nowrap">
                            {reply.time}
                          </span>
                        </div>

                        <div className="text-[12px] leading-snug opacity-70  break-words pr-8">
                          {reply.deleted_at ? (
                            <em className="text-gray-500 italic">
                              [This message was deleted]
                            </em>
                          ) : editingId === reply.comment_id ? (
                            /* EDIT MODE */
                            <div className="flex flex-col gap-2 mt-4">
                              <textarea
                                autoFocus
                                className="w-full bg-white/5 border border-purple-500/50 rounded-lg p-2 text-[12px]  focus:outline-none min-h-[2.5rem]"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-[10px] uppercase opacity-50 hover:opacity-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    editCommentOrReply(
                                      comment.comment_id,
                                      reply.comment_id,
                                    )
                                  } // For replies, pass parentId too
                                  className="text-[10px] uppercase text-amber-500 opacity-80 hover:opacity-100 font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* NORMAL MODE */
                            reply.content
                          )}
                          <div className="flex sm:hidden gap-2 pb-0 mt-2">
                            {reply.host && (
                              <span className="bg-purple-500/20 text-purple-300 text-[7px] px-1.5 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase tracking-wider">
                                Host
                              </span>
                            )}
                            {reply.is_querying_user && (
                              <span className="bg-blue-500/20 text-blue-300 text-[7px] px-1.5 py-0.5 rounded-full border border-blue-500/30 font-bold uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* This will now trigger because the parent has group/reply */}
                      <div className="absolute top-2 right-2 z-10 lg:opacity-0 group-hover/reply:opacity-100 transition-opacity">
                        <CommentOptions
                          comment={reply}
                          onDelete={() =>
                            deleteCommentOrReply(
                              comment.comment_id,
                              reply.comment_id,
                            )
                          }
                          isDeleted={!!reply.deleted_at}
                          onRestore={() => {
                            restoreCommentOrReply(
                              comment.comment_id,
                              reply.comment_id,
                            );
                          }}
                          onReport={() => {
                            reportCommentOrReply(
                              comment.comment_id,
                              reply.comment_id,
                            );
                          }}
                          onEdit={() => {
                            setEditValue(reply.content);
                            setEditingId(reply.comment_id);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin text-purple-300"
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface CommentOptionsProps {
  comment: any;
  onDelete: () => void;
  onRestore: () => void; // New prop for reviving
  onReport: () => void; // New prop for reviving
  onEdit: () => void;
  isDeleted: boolean; // Pass (deleted_at !== null) here
}

export function CommentOptions({
  comment,
  onDelete,
  onRestore,
  onReport,
  onEdit,
  isDeleted,
}: CommentOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded-md transition-colors ${
          isOpen ? 'bg-white/20' : 'hover:bg-white/10'
        } text-white/60 hover:text-white`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-1 w-36 bg-[#121212] border border-white/10 rounded-md shadow-2xl py-1.5 px-1.5 overflow-hidden z-50 backdrop-blur-sm">
            {comment.is_querying_user ? (
              <div className="flex flex-col gap-0.5">
                {/* OWNER ACTIONS */}
                {!isDeleted && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onEdit();
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-all flex items-center gap-2.5"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-60"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                    Edit
                  </button>
                )}

                {isDeleted ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onRestore();
                    }}
                    /* Removed hover:bg-emerald-500/10 - now just text and icon transition */
                    className="w-full text-left px-3 py-2 text-[11px] font-medium text-emerald-400/80 hover:text-emerald-400 transition-colors flex items-center gap-2.5 group"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      /* Icon starts very dim, lights up on hover */
                      className="opacity-30 group-hover:opacity-100 transition-opacity"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onDelete();
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all flex items-center gap-2.5"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            ) : (
              /* REPORT BUTTON: No background fill on hover */
              <button
                onClick={() => {
                  setIsOpen(false);
                  onReport();
                }}
                className="w-full text-left px-3 py-2 text-[11px] font-semibold text-white/30 hover:text-orange-400/80 transition-colors flex items-center gap-2.5 group"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-40 group-hover:opacity-100 transition-opacity"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                Report Content
              </button>
            )}
          </div>
        </>
      )}
      <Toaster />
    </div>
  );
}
