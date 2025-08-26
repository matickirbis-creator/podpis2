import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from 'fontkit';

const DEFAULT_FONT_REGULAR = process.env.FONT_URL_REGULAR || 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
const DEFAULT_FONT_BOLD = process.env.FONT_URL_BOLD || 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf';

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ne morem prenesti pisave: ${url} (${res.status})`);
  return await res.arrayBuffer();
}

export async function generatePdf(payload: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Naloži Unicode pisavi (Noto Sans) – podpirata šumnike (č,š,ž)
  const [regularFontBytes, boldFontBytes] = await Promise.all([
    fetchArrayBuffer(DEFAULT_FONT_REGULAR),
    fetchArrayBuffer(DEFAULT_FONT_BOLD),
  ]);

  const regularFont = await pdfDoc.embedFont(new Uint8Array(regularFontBytes), { subset: true });
  const boldFont = await pdfDoc.embedFont(new Uint8Array(boldFontBytes), { subset: true });

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const margin = 40;
  let y = height - margin;

  const drawText = (text: string, font = regularFont, size = 12) => {
    page.drawText(String(text ?? ''), { x: margin, y, size, font, color: rgb(0,0,0)});
    y -= size + 8;
  };

  page.drawText('Ordinacija – Izpolnjen obrazec in podpis', { x: margin, y, size: 18, font: boldFont });
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

  drawText('Izjava:', boldFont);
  drawText('S podpisom potrjujem točnost navedenih podatkov in soglašam z obdelavo osebnih podatkov za potrebe izvajanja zobozdravstvenih storitev.');

  line();
  drawText('Podpis:', boldFont);

  if (payload.signature && typeof payload.signature === 'string' && payload.signature.startsWith('data:image/')) {
    const base64 = payload.signature.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');
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
