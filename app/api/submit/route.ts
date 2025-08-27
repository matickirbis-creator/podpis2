import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '../../../lib/pdf';
import { Resend } from 'resend';

function uniq(emails: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of emails) {
    const v = String(e || '').trim().toLowerCase();
    if (v && !seen.has(v)) { seen.add(v); out.push(v); }
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pdfBytes = await generatePdf(body);

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.FROM_EMAIL;
    if (!resendKey || !from) throw new Error('Manjka RESEND_API_KEY ali FROM_EMAIL.');

    const resend = new Resend(resendKey);

    const envDoctor = (process.env.DOCTOR_EMAIL || 'ebamatic@gmail.com').trim();
    const formDoctor = String(body.doctorEmail || '').trim();
    const patientEmail = String(body.email || '').trim();
    const fullName = String(body.fullName || '');
    const filename = `obrazec-${Date.now()}.pdf`;
    const base64 = Buffer.from(pdfBytes).toString('base64');

    // Build recipient list: env doctor, form doctor, patient (optional)
    const recipients = uniq([envDoctor, formDoctor, patientEmail]);

    const results = [];
    for (const to of recipients) {
      if (!to) continue;
      const subject = (to.toLowerCase() === patientEmail.toLowerCase())
        ? 'FDI vprašalnik – vaš izpolnjen obrazec (PDF)'
        : 'FDI vprašalnik – izpolnjen obrazec pacienta (PDF)';
      const text = (to.toLowerCase() === patientEmail.toLowerCase())
        ? 'V priponki je vaš izpolnjen obrazec s podpisom. Hvala.'
        : `V priponki je izpolnjen obrazec pacienta ${fullName}.`;

      const res: any = await resend.emails.send({
        from, to, subject, text,
        attachments: [{ filename, content: base64 }],
      });
      results.push({ to, id: res?.id ?? res?.data?.id ?? null, error: res?.error ?? null });
    }

    console.log('[EMAIL SEND SUMMARY]', results);

    const allOk = results.every(r => r.id && !r.error);
    return NextResponse.json({ ok: allOk, recipients: results }, { status: allOk ? 200 : 500 });
  } catch (err: any) {
    console.error('[Submit API] Error:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Napaka na strežniku.' }, { status: 500 });
  }
}
