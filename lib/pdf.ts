import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generatePdf(payload: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  let y = height - margin;

  const drawText = (text: string, f = font, size = 12) => {
    page.drawText(text, { x: margin, y, size, font: f, color: rgb(0,0,0)});
    y -= size + 8;
  };

  page.drawText('Ordinacija – Izpolnjen obrazec in podpis', { x: margin, y, size: 18, font: fontBold });
  y -= 28;

  const line = () => {
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.8,0.8,0.8) });
    y -= 16;
  };

  drawText(`Ime in priimek: ${payload.fullName ?? ''}`);
  drawText(`E-mail: ${payload.email ?? ''}`);
  drawText(`Datum rojstva: ${payload.dob ?? ''}`);
  drawText(`Alergije na zdravila: ${payload.allergies ?? ''}`);
  drawText(`Redna zdravila: ${payload.medications ?? ''}`);
  drawText(`Dodatne informacije: ${payload.notes ?? ''}`);
  line();

  drawText('Izjava:', fontBold);
  drawText('S podpisom potrjujem točnost navedenih podatkov in soglašam z obdelavo osebnih podatkov za potrebe izvajanja zobozdravstvenih storitev.');

  line();
  drawText('Podpis:', fontBold);

  if (payload.signature && typeof payload.signature === 'string' && payload.signature.startsWith('data:image/')) {
    const base64 = payload.signature.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const pngImage = await pdfDoc.embedPng(bytes);
    const pngDims = pngImage.scale(0.5);
    const sigWidth = Math.min(pngDims.width, width - margin * 2);
    const scale = sigWidth / pngDims.width;
    const sigHeight = pngDims.height * scale;

    page.drawImage(pngImage, {
      x: margin,
      y: y - sigHeight - 8,
      width: sigWidth,
      height: sigHeight,
    });
    y -= sigHeight + 24;
  } else {
    drawText('(ni podpisa)');
  }

  drawText(`Datum generiranja: ${new Date().toLocaleString('sl-SI')}`);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
