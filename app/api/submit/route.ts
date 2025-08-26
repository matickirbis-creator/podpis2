import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '../../../lib/pdf';
import { Resend } from 'resend';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Manjka env spremenljivka ${name}`);
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pdfBytes = await generatePdf(body);

    const resend = new Resend(requiredEnv('RESEND_API_KEY'));
    const from = requiredEnv('FROM_EMAIL');
    const doctorEmail = requiredEnv('DOCTOR_EMAIL');
    const patientEmail = String(body.email || '').trim();

    if (!patientEmail) throw new Error('E-mail pacienta manjka.');

    const filename = `obrazec-${Date.now()}.pdf`;
    const base64 = Buffer.from(pdfBytes).toString('base64');

    await resend.emails.send({
      from,
      to: [patientEmail, doctorEmail],
      subject: 'Izpolnjen obrazec in podpis (PDF)',
      text: 'V priponki je izpolnjen obrazec s podpisom. Hvala.',
      attachments: [{ filename, content: base64 }],
    });

    return NextResponse.json({ ok: true, message: 'Uspešno oddano. PDF je poslan na oba e-maila.' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, message: err?.message || 'Napaka na strežniku.' }, { status: 500 });
  }
}
