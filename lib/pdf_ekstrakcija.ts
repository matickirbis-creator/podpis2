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
    if (width <= maxWidth) line = test;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generatePdfEkstrakcija(payload: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [regularFontBytes, boldFontBytes] = await Promise.all([
    fetchArrayBuffer(DEFAULT_FONT_REGULAR),
    fetchArrayBuffer(DEFAULT_FONT_BOLD),
  ]);
  const regularFont = await pdfDoc.embedFont(new Uint8Array(regularFontBytes), { subset: true });
  const boldFont = await pdfDoc.embedFont(new Uint8Array(boldFontBytes), { subset: true });

  let page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  const ensureSpace = (needed: number) => { if (y - needed < margin) { page = pdfDoc.addPage([595.28, 841.89]); y = height - margin; } };
  const drawWrapped = (text: string, font: any, size: number) => {
    const maxWidth = width - margin * 2;
    const lines = wrapText(text, font, size, maxWidth);
    for (const ln of lines) { ensureSpace(size + 8); page.drawText(ln, { x: margin, y, size, font, color: rgb(0,0,0)}); y -= size + 8; }
  };
  const drawKV = (label: string, value: string, font = regularFont, size = 12) => {
    const labelText = label + (label.endsWith(':') ? '' : ':');
    drawWrapped(`${labelText} ${value || ''}`, font, size);
  };

  // Header/logo/title
  try {
    const logoBytes = await fetchArrayBuffer(DEFAULT_LOGO_URL);
    const png = await pdfDoc.embedPng(new Uint8Array(logoBytes));
    const logoW = 110; const logoH = (png.height / png.width) * logoW;
    ensureSpace(logoH + 40);
    page.drawImage(png, { x: (width - logoW)/2, y: y - logoH, width: logoW, height: logoH });
    y -= logoH + 12;
  } catch {}
  drawWrapped('OBRAZEC ZA PRISTANEK NA EKSTRAKCIJO ZOBA/OBRAVNAVO', boldFont, 18);

  // Fields
  drawKV('Datum', payload.docDate);
  drawKV('Ime in priimek zobozdravnika', payload.doctorName);

  drawWrapped('Podatki o zobu za ekstrakcijo:', boldFont, 13);
  drawKV('Lokacija zoba', payload.toothLocation || '');
  drawKV('Številka zoba', payload.toothNumber || '');

  drawWrapped('Pacientovi podatki:', boldFont, 13);
  drawKV('Ime in priimek', payload.fullName);
  drawKV('Elektronski naslov', payload.email || '');
  drawKV('Datum rojstva', payload.dob);
  drawKV('Kontaktna telefonska številka', payload.phone);

  drawWrapped('Opis posega', boldFont, 13);
  drawWrapped('Ekstrakcija zoba je kirurški postopek odstranjevanja zoba iz ustne votline. Postopek se izvaja pod lokalno anestezijo in vključuje odstranjevanje zoba ter, če je potrebno, čiščenje in šivanje rane.', regularFont, 12);

  drawWrapped('Možna tveganja in zapleti', boldFont, 13);
  const risks = [
    'Krvavitve',
    'Okužbe',
    'Otekanje in bolečina',
    'Poškodbe sosednjih zob ali struktur',
    'Zapleti zaradi anestezije',
  ];
  for (const r of risks) drawWrapped('• ' + r, regularFont, 12);
  drawWrapped('Če imate vprašanja ali posebne skrbi, prosimo, da se posvetujete z zobozdravnikom.', regularFont, 12);

  drawWrapped('S potrditvijo tega obrazca potrjujem:', boldFont, 13);
  const consent = [
    'Da sem bil/-a ustrezno obveščen/-a o poteku posega, možnih tveganjih in zapletih.',
    'Da sem imel/-a možnost postaviti vprašanja in so mi bila razumljivo pojasnjena.',
    'Da se prostovoljno strinjam z izvedbo posega.',
  ];
  for (const c of consent) drawWrapped('• ' + c, regularFont, 12);

  // Signature
  drawWrapped('Podpis:', boldFont, 13);
  if (payload.signature && typeof payload.signature === 'string' && payload.signature.startsWith('data:image/')) {
    const base64 = payload.signature.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');
    const png = await pdfDoc.embedPng(bytes);
    const maxW = width - margin * 2;
    if (y - 140 < margin) { page = pdfDoc.addPage([595.28, 841.89]); y = height - margin; }
    const maxH = Math.max(120, y - margin - 20);
    let w = Math.min(png.width, maxW);
    let h = (png.height / png.width) * w;
    if (h > maxH) { h = maxH; w = (png.width / png.height) * h; }
    page.drawImage(png, { x: margin, y: y - h, width: w, height: h });
    y -= h + 8;
  } else {
    drawWrapped('(ni podpisa)', regularFont, 12);
  }

  drawWrapped(`Datum in ura oddaje: ${new Date().toLocaleString('sl-SI')}`, regularFont, 11);
  drawWrapped('Build: multi-forms-5', regularFont, 9);

  return await pdfDoc.save();
}
