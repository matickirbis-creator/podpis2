import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const env = {
      smtpUser: process.env.SMTP_USER || null,
      hasPass: Boolean(process.env.SMTP_PASS),
      fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER || null,
      doctorEmail: process.env.DOCTOR_EMAIL || 'ebamatic@gmail.com',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
      node: process.version,
    };

    if (!env.smtpUser || !env.hasPass || !env.fromEmail) {
      return NextResponse.json({ ok: false, env, note: 'Manjka SMTP_USER/SMTP_PASS/FROM_EMAIL' }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      host: env.host,
      port: env.port,
      secure: env.secure,
      auth: { user: env.smtpUser!, pass: process.env.SMTP_PASS! },
    });

    const info = await transporter.sendMail({
      from: env.fromEmail!,
      to: env.doctorEmail!,
      subject: 'SMTP debug – Ordinacija',
      text: 'To je testno SMTP sporočilo iz /api/debug. Če to vidiš, SMTP deluje.',
    });

    return NextResponse.json({ ok: true, env, info }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
