'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../app/api/auth/[...nextauth]/route';

export async function createComment(
  jamId: string,
  content: string,
  parentId: string | null = null, // Default values must be at the end
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  const userEmail = session.user.email;

  const { data, error } = await supabaseAdmin.rpc('insert_comment', {
    p_jam_id: jamId,
    p_content: content,
    p_parent_id: parentId,
    p_email: userEmail,
  });

  if (error) {
    console.log(error);
    return { error: error.message, status: 500 };
  }

  // The RPC returns a set of rows; grab the single inserted row.
  const inserted = Array.isArray(data) ? data[0] : data;

  return {
    success: true,
    comment: {
      comment_id: inserted?.comment_id as string,
      created_at: inserted?.created_at as string,
    },
  };
}

/**
 * EDIT A COMMENT
 */
export async function editComment(
  commentId: string,
  newContent: string,
  jamId: string,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  const userEmail = session.user.email;

  const { error } = await supabaseAdmin.rpc('edit_user_comment', {
    p_comment_id: commentId,
    p_jam_id: jamId,
    p_email: userEmail,
    p_content: newContent,
  });

  

  if (error) {
    console.log(error);
    return { error: error.message, status: 500 };
  }

  return { success: true };
}

/**
 * DELETE A COMMENT
 */
export async function deleteComment(commentId: string, jamId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  const userEmail = session.user.email;

  const { error } = await supabaseAdmin.rpc('delete_user_comment', {
    p_comment_id: commentId,
    p_jam_id: jamId,
    p_email: userEmail,
  });

  if (error) {
    console.log(error);
    return { error: error.message, status: 500 };
  }

  return { success: true };
}

export async function restoreComment(commentId: string, jamId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  const userEmail = session.user.email;

  const { error } = await supabaseAdmin.rpc('restore_user_comment', {
    p_comment_id: commentId,
    p_jam_id: jamId,
    p_email: userEmail,
  });

  if (error) {
    console.log(error);
    return { error: error.message, status: 500 };
  }

  return { success: true };
}

/**
 * REPORT A COMMENT
 */
export async function reportComment(commentId: string, jamId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  const userEmail = session.user.email;

  const { error } = await supabaseAdmin.rpc('report_user_comment', {
    p_comment_id: commentId,
    p_jam_id: jamId,
    p_email: userEmail,
  });

  if (error) {
    console.log(error);
    return { error: error.message, status: 500 };
  }

  return { success: true };
}
