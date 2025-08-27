import { NextRequest, NextResponse } from 'next/server';
import { generatePdfFDI } from '../../../lib/pdf_fdi';
import { generatePdfImplant } from '../../../lib/pdf_implant';
import { generatePdfProtetika } from '../../../lib/pdf_protetika';
import nodemailer from 'nodemailer';

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
    const pdfBytes = body?.formType === 'implant' ? await generatePdfImplant(body)
      : body?.formType === 'protetika' ? await generatePdfProtetika(body)
      : await generatePdfFDI(body);

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || smtpUser;
    if (!smtpUser || !smtpPass || !fromEmail) {
      throw new Error('Manjka SMTP_USER, SMTP_PASS ali FROM_EMAIL.');
    }

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const envDoctor = (process.env.DOCTOR_EMAIL || 'ebamatic@gmail.com').trim();
    const formDoctor = String(body.doctorEmail || '').trim();
    const patientEmail = String(body.email || '').trim();
    const fullName = String(body.fullName || '');
    const filename = `obrazec-${Date.now()}.pdf`;
    const buffer = Buffer.from(pdfBytes);

    const recipients = uniq([envDoctor, formDoctor, patientEmail]);
    const results: any[] = [];

    for (const to of recipients) {
      if (!to) continue;
      const isPatient = patientEmail && to.toLowerCase() === patientEmail.toLowerCase();
      const subject = isPatient
        ? (body?.formType === 'implant' ? 'Implant – vaš izpolnjen obrazec (PDF)'
          : body?.formType === 'protetika' ? 'Protetika – vaš izpolnjen obrazec (PDF)'
          : 'FDI vprašalnik – vaš izpolnjen obrazec (PDF)')
        : (body?.formType === 'implant' ? 'Implant – izpolnjen obrazec pacienta (PDF)'
          : body?.formType === 'protetika' ? 'Protetika – izpolnjen obrazec pacienta (PDF)'
          : 'FDI vprašalnik – izpolnjen obrazec pacienta (PDF)');
      const text = isPatient
        ? 'V priponki je vaš izpolnjen obrazec s podpisom. Hvala.\n\nLep pozdrav,\nAntonio Koderman.'
        : `V priponki je izpolnjen obrazec pacienta ${fullName}.\n\nLep pozdrav,\nAntonio Koderman.`;

      try {
        const info = await transport.sendMail({
          from: fromEmail,
          to,
          subject,
          text,
          attachments: [{ filename, content: buffer }],
        });
        results.push({ to, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected });
      } catch (err: any) {
        results.push({ to, error: String(err?.message || err) });
      }
    }

    console.log('[SMTP SEND SUMMARY]', results);
    const allOk = results.every(r => r.accepted && r.accepted.length > 0 && (!r.rejected || r.rejected.length === 0));
    return NextResponse.json({ ok: allOk, recipients: results }, { status: allOk ? 200 : 500 });
  } catch (err: any) {
    console.error('[Submit API] Error:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Napaka na strežniku.' }, { status: 500 });
  }
}
