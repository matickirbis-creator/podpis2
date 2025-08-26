import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    const env = {
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      fromEmail: process.env.FROM_EMAIL || null,
      doctorEmail: process.env.DOCTOR_EMAIL || null,
      node: process.version,
    };

    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL || !process.env.DOCTOR_EMAIL) {
      return NextResponse.json({ ok: false, env, note: 'Manjkajo ENV spremenljivke.' }, { status: 200 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const send = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.DOCTOR_EMAIL!,
      subject: 'Test – Ordinacija debug',
      text: 'To je testno sporočilo iz /api/debug. Če to vidiš, Resend deluje za doctorEmail.',
    });

    return NextResponse.json({ ok: true, env, send }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
