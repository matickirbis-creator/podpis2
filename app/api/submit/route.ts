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
    const fullName = String(body.fullName || '');

    if (!patientEmail) throw new Error('E-mail pacienta manjka.');

    const filename = `obrazec-${Date.now()}.pdf`;
    const base64 = Buffer.from(pdfBytes).toString('base64');

    const payloadPatient = {
      from,
      to: patientEmail,
      subject: 'Izpolnjen obrazec in podpis (PDF)',
      text: 'V priponki je izpolnjen obrazec s podpisom. Hvala.',
      attachments: [{ filename, content: base64 }],
    };

    const payloadDoctor = {
      from,
      to: doctorEmail,
      subject: 'Kopija: izpolnjen obrazec pacienta (PDF)',
      text: `V priponki je kopija izpolnjenega obrazca pacienta ${fullName}.`,
      attachments: [{ filename, content: base64 }],
    };

    const [resPatient, resDoctor] = await Promise.allSettled([
      resend.emails.send(payloadPatient),
      resend.emails.send(payloadDoctor),
    ]);

    const result: any = { ok: true, message: 'Oddano. PDF poslan (pacient + ordinacija).', meta: {} };

    if (resPatient.status === 'fulfilled') {
      result.meta.patientId = (resPatient.value as any)?.id;
    } else {
      console.error('[Email Patient] Failed:', resPatient.reason);
      result.ok = false;
      result.message = 'PDF NI bil poslan pacientu – preveri loge.';
    }

    if (resDoctor.status === 'fulfilled') {
      result.meta.doctorId = (resDoctor.value as any)?.id;
    } else {
      console.error('[Email Doctor] Failed:', resDoctor.reason);
      result.message += ' (Opozorilo: e-mail ordinaciji ni bil poslan)';
      result.meta.doctorError = String(resDoctor.reason?.message || resDoctor.reason || 'Unknown');
    }

    console.log('[Resend IDs]', result.meta);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err: any) {
    console.error('[Submit API] Error:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Napaka na strežniku.' }, { status: 500 });
  }
}
