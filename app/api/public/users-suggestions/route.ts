import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/contact';



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { msg, email } = body;

    const sender_ip = req.headers.get('x-forwarded-for')?.split(',')[0] || null;
    const user_agent = req.headers.get('user-agent') || null;


  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }



    const { data, error } = await supabaseAdmin
      .from('user_suggestions')
      .insert({
        sender_email: parsed.data.email,
        message: parsed.data.msg,
        sender_ip,
        user_agent,
      })
      .select()
      .maybeSingle();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
