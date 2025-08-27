import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const DEFAULT_FONT_REGULAR = process.env.FONT_URL_REGULAR || 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
const DEFAULT_FONT_BOLD = process.env.FONT_URL_BOLD || 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf';
const DEFAULT_LOGO_URL = process.env.LOGO_URL || 'https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png';

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ne morem prenesti vira: ${url} (${res.status})`);
  return await res.arrayBuffer();
}

function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const words = String(text || '').split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    const width = font.widthOfTextAtSize(test, size);
    if (width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generatePdfFDI(payload: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [regularFontBytes, boldFontBytes] = await Promise.all([
    fetchArrayBuffer(DEFAULT_FONT_REGULAR),
    fetchArrayBuffer(DEFAULT_FONT_BOLD),
  ]);
  const regularFont = await pdfDoc.embedFont(new Uint8Array(regularFontBytes), { subset: true });
  const boldFont = await pdfDoc.embedFont(new Uint8Array(boldFontBytes), { subset: true });

  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  const ensureSpace = (needed: number) => {
    if (y - needed < margin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }
  };

  const drawWrapped = (text: string, font: any, size: number) => {
    const maxWidth = width - margin * 2;
    const lines = wrapText(text, font, size, maxWidth);
    for (const ln of lines) {
      ensureSpace(size + 8);
      page.drawText(ln, { x: margin, y, size, font, color: rgb(0,0,0)});
      y -= size + 8;
    }
  };

  const drawKV = (label: string, value: string, font = regularFont, size = 12) => {
    const labelText = label + (label.endsWith(':') ? '' : ':');
    drawWrapped(`${labelText} ${value || ''}`, font, size);
  };

  const hr = () => {
    ensureSpace(16);
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.85,0.85,0.85) });
    y -= 12;
  };

  // Header: centered bigger logo and title
  try {
    const logoBytes = await fetchArrayBuffer(DEFAULT_LOGO_URL);
    const png = await pdfDoc.embedPng(new Uint8Array(logoBytes));
    const logoW = 110;
    const logoH = (png.height / png.width) * logoW;
    ensureSpace(logoH + 40);
    page.drawImage(png, { x: (width - logoW)/2, y: y - logoH, width: logoW, height: logoH });
    y -= logoH + 12;
  } catch {}
  drawWrapped('Vprašalnik o zdravju po priporočilih FDI', boldFont, 18);

  // Basic info
  drawKV('Ime in priimek', payload.fullName);
  drawKV('Email', payload.email);
  drawKV('Če vprašalnik izpolnjuje druga oseba', payload.proxyName || '');
  drawKV('Spol', payload.gender || '');
  drawKV('Datum rojstva', payload.dob || '');
  drawKV('Kontaktna številka', payload.phone || '');
  drawKV('Naslov', payload.address || '');
  hr();

  // Health
  drawKV('Ali bolehate za katero boleznijo?', payload.hasDisease || '');
  if (payload.diseaseName) drawKV('Če DA, katero', payload.diseaseName);
  drawKV('Ali ste bili na operaciji v zadnjih dveh letih?', payload.hadSurgery || '');
  if (payload.surgeryName) drawKV('Če DA, na kateri', payload.surgeryName);
  drawKV('Ali jemljete zdravila?', payload.takesMeds || '');
  if (payload.medsList) drawKV('Katera', payload.medsList);
  drawKV('Ali ste alergični na zdravilo/antibiotik/snov?', payload.hasAllergy || '');
  if (payload.allergyName) drawKV('Če DA, na katero', payload.allergyName);
  drawKV('Ali ste noseči? (ženske)', payload.pregnant || '');
  drawKV('Ste kadilec?', payload.smoker || '');
  if (payload.cigsPerDay) drawKV('Če DA, koliko cigaret na dan', payload.cigsPerDay);
  hr();

  // Statements exact text
  drawWrapped('S podpisom potrjujem in se strinjam z naslednjimi izjavami:', boldFont, 13);
  const st = [
    'Pristanem na zobozdravniško zdravljenje ali protetično oskrbo na meni/mojem otroku, kot mi je predložil zobozdravnik.',
    'Pristanem na anestezijo.',
    'Seznanjen/a sem, da je uspeh posega odvisen od organizma, zobozdravnika, vrste posega in ravnanja bolnika pred/po posegu.',
    'Seznanjen/a sem, da je končni rezultat in učinek posega viden šele po 6–12 mesecih po posegu.',
    'Pristanem na fotografiranje ali snemanje zaradi medicinske dokumentacije.',
    'Pristanem na uporabo fotodokumentacije v medicinskoznanstvene, strokovne ali poučne namene, brez razkritja identitete.',
    'Izjavljam, da sem v pogovoru z zobozdravnikom dobil/a vse želene informacije o posegu, za katerega sem se prostovoljno odločil/a.',
    'Potrjujem, da sem s polnim razumevanjem in pri polni zavesti, svojevoljno podpisal/a to izjavo.',
  ];
  for (const s of st) drawWrapped('• ' + s, regularFont, 12);
  hr();

  // Signature
  drawWrapped('Podpis:', boldFont, 13);
  if (payload.signature && typeof payload.signature === 'string' && payload.signature.startsWith('data:image/')) {
    const base64 = payload.signature.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');
    const png = await pdfDoc.embedPng(bytes);

    // new page if not enough space
    const minHeight = 140;
    if (y - minHeight < margin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }
    const maxW = width - margin * 2;
    const maxH = Math.max(120, y - margin - 20);
    let w = Math.min(png.width, maxW);
    let h = (png.height / png.width) * w;
    if (h > maxH) { h = maxH; w = (png.width / png.height) * h; }
    page.drawImage(png, { x: margin, y: y - h, width: w, height: h });
    y -= h + 8;
  } else {
    drawWrapped('(ni podpisa)', regularFont, 12);
  }

  // Timestamp + build marker
  drawWrapped(`Datum in ura oddaje: ${new Date().toLocaleString('sl-SI')}`, regularFont, 11);
  drawWrapped('Build: latest-smtp', regularFont, 9);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
