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

export async function generatePdfProtetika(payload: any): Promise<Uint8Array> {
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
  const hr = () => { ensureSpace(16); page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.85,0.85,0.85) }); y -= 12; };

  // Header/logo/title
  try {
    const logoBytes = await fetchArrayBuffer(DEFAULT_LOGO_URL);
    const png = await pdfDoc.embedPng(new Uint8Array(logoBytes));
    const logoW = 110; const logoH = (png.height / png.width) * logoW;
    ensureSpace(logoH + 40);
    page.drawImage(png, { x: (width - logoW)/2, y: y - logoH, width: logoW, height: logoH });
    y -= logoH + 12;
  } catch {}
  drawWrapped('OBRAZEC ZA PRIVOLITEV PACIENTA - KONČANO PROTETIKO', boldFont, 18);

  drawWrapped('Spoštovani/a pacient/ka, Zahvaljujemo se vam za zaupanje in sodelovanje pri izdelavi protetičnega nadomestka. Pred zaključkom postopka je pomembno, da ste seznanjeni z določenimi informacijami in podate privolitev za izvedbo protetične obravnave.', regularFont, 12);

  // Fields
  drawKV('Datum dokumenta', payload.docDate);
  drawKV('Elektronski naslov', payload.email);
  drawKV('Ime in priimek', payload.fullName);
  drawKV('Datum rojstva', payload.dob);
  drawKV('Telefonska številka', payload.phone);
  hr();

  // Statements
  drawWrapped('S tem obrazcem potrjujem, da sem bil/a:', boldFont, 13);
  const s1 = [
    'Seznanjen/a z diagnozo, predlaganim protetičnim zdravljenjem ter alternativnimi možnostmi, ki so mi bile razložene.',
    'Obveščen/a o prednostih in morebitnih tveganjih, povezanih s predlaganim zdravljenjem, vključno s komplikacijami, ki lahko nastanejo med ali po zdravljenju.',
    'Pojasnjen/a o potrebni skrbi za protetični nadomestek, rednem vzdrževanju ter preventivnih obiskih pri zobozdravniku za dolgoročno uspešnost zdravljenja.',
    'Zavedam se, da se estetika in funkcionalnost protetičnega nadomestka lahko razlikujeta glede na individualne anatomske in biološke značilnosti.',
  ];
  for (const t of s1) drawWrapped('• ' + t, regularFont, 12);

  drawWrapped('S svojim podpisom potrjujem, da:', boldFont, 13);
  const s2 = [
    'Prostovoljno soglašam z dokončno izdelavo in vgradnjo protetičnega nadomestka.',
    'Razumem vse posredovane informacije in sem imel/a možnost postaviti dodatna vprašanja.',
    'Sem pripravljen/a sodelovati pri nadaljnjih postopkih in priporočilih za ustrezno uporabo protetičnega nadomestka.',
  ];
  for (const t of s2) drawWrapped('• ' + t, regularFont, 12);

  drawWrapped('Garancija se upošteva ob rednih enoletnih pregledih, kjer se opravi slikovna dijagnostika in čiščenje mehkih in trdih blog. Na vso protetiko velja 2 letna garancija, kjer vam pokrijemo 100% nastalih stroškov. Po 2 ter vse do 5 let, v primeru težav, lomov ali drugih komplikacija vam krijemo 30% stroškov. Po 5 letih vse nastale stroške krije pacijent.', regularFont, 12);
  drawWrapped('Opomba: Če imate kakršnekoli dodatne pomisleke ali vprašanja, se obrnite na svojega zobozdravnika pred dokončno izdelavo protetičnega nadomestka.', regularFont, 12);
  drawWrapped('Hvala za vaše sodelovanje in zaupanje!', regularFont, 12);

  // Signature
  drawWrapped('Podpis:', boldFont, 13);
  if (payload.signature && typeof payload.signature === 'string' && payload.signature.startsWith('data:image/')) {
    const base64 = payload.signature.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');
    const png = await pdfDoc.embedPng(bytes);
    if (y - 140 < margin) { page = pdfDoc.addPage([595.28, 841.89]); y = height - margin; }
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

  drawWrapped(`Datum in ura oddaje: ${new Date().toLocaleString('sl-SI')}`, regularFont, 11);
  drawWrapped('Build: multi-forms-3', regularFont, 9);

  return await pdfDoc.save();
}
