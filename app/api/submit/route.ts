import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '../../../lib/pdf';
import { Resend } from 'resend';

function requiredEnv(name: string): string | null {
  return process.env[name] || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pdfBytes = await generatePdf(body);

    const resendKey = requiredEnv('RESEND_API_KEY');
    const from = requiredEnv('FROM_EMAIL');
    if (!resendKey || !from) throw new Error('Manjka RESEND_API_KEY ali FROM_EMAIL.');

    const resend = new Resend(resendKey);
    const doctorEmail = requiredEnv('DOCTOR_EMAIL') || 'ebamatic@gmail.com';
    const patientEmail = String(body.email || '').trim();
    const fullName = String(body.fullName || '');
    const filename = `obrazec-${Date.now()}.pdf`;
    const base64 = Buffer.from(pdfBytes).toString('base64');

    // Always send to doctor
    const doctorPayload = {
      from,
      to: doctorEmail,
      subject: 'FDI vprašalnik – izpolnjen obrazec pacienta (PDF)',
      text: `V priponki je izpolnjen obrazec pacienta ${fullName}.`,
      attachments: [{ filename, content: base64 }],
    };

    // Optionally send to patient if email present
    const tasks: Promise<any>[] = [resend.emails.send(doctorPayload)];
    if (patientEmail) {
      tasks.push(resend.emails.send({
        from,
        to: patientEmail,
        subject: 'FDI vprašalnik – vaš izpolnjen obrazec (PDF)',
        text: 'V priponki je vaš izpolnjen obrazec s podpisom. Hvala.',
        attachments: [{ filename, content: base64 }],
      }));
    }

    const results = await Promise.allSettled(tasks);
    console.log('[EMAIL RESULTS]', results);

    const okDoctor = results[0].status === 'fulfilled' && (!!(results[0] as any).value?.id || !!(results[0] as any).value?.data?.id);
    const okPatient = tasks.length === 2 ? (results[1].status === 'fulfilled' && (!!(results[1] as any).value?.id || !!(results[1] as any).value?.data?.id)) : true;

    const ok = okDoctor && okPatient;
    const message = ok
      ? 'Uspešno oddano. PDF je poslan ordinaciji in (če je vpisan) pacientu.'
      : 'Oddano z opozorili: preveri e-pošto ordinacije/pacienta in Resend loge.';

    return NextResponse.json({ ok, message }, { status: ok ? 200 : 500 });
  } catch (err: any) {
    console.error('[Submit API] Error:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Napaka na strežniku.' }, { status: 500 });
  }
}
