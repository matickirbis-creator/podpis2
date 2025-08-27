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

export async function generatePdfImplant(payload: any): Promise<Uint8Array> {
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

  // Header
  try {
    const logoBytes = await fetchArrayBuffer(DEFAULT_LOGO_URL);
    const png = await pdfDoc.embedPng(new Uint8Array(logoBytes));
    const logoW = 110; const logoH = (png.height / png.width) * logoW;
    ensureSpace(logoH + 40);
    page.drawImage(png, { x: (width - logoW)/2, y: y - logoH, width: logoW, height: logoH });
    y -= logoH + 12;
  } catch {}
  drawWrapped('IZJAVA PRED IMPLANTOLOŠKIM POSEGOM', boldFont, 18);

  drawWrapped('Spoštovani pacijent/ka, tale obrazec je namenjen temu, da povzamemo kar smo se pogovarjali tekom pregleda in da prostovoljno privolite v poseg, ki je načrtovan.', regularFont, 12);

  // Fields
  drawKV('Datum dokumenta', payload.docDate);
  drawKV('Diagnoza', payload.diagnosis);
  drawKV('Ime in priimek zobozdravnika', payload.doctorName);
  hr();

  drawWrapped('Podatki pacienta:', boldFont, 13);
  drawKV('Ime in priimek', payload.fullName);
  drawKV('Elektronski naslov', payload.email || '');
  hr();

  drawWrapped('Potek', boldFont, 13);
  drawWrapped('Pred samim posegom prejmete 2g Amoksiklava ali 600 Klimicina (v kolikor so prisotne alergije na penicilin), protibolečinsko tableto NSAID ibuprofen 400mg ali drug analgetik v kolikor navedete alergije.', regularFont, 12);
  drawKV('Alergije', payload.allergies);

  drawWrapped('Postopek petek v lokalni anesteziji z zagotovljenim sterilnim delovnim poljem. Implantate ki vam jih vstavimo so narejeni iz zlitine zirkona in titana. Implantate ki jih vstavljamo so znanega italijanskega proizvajalca Sweden & Martina in so trenutno vodilni v tehnologiji, prodaji in izdelavi implantatov v svetu.', regularFont, 12);

  drawWrapped('PREDNOSTI POSEGA:', boldFont, 13);
  drawWrapped('• Možnost nadomeščanja enega ali več zobov, brez brušenja ostalih zobov, s fiksnim izdelkom.', regularFont, 12);

  drawWrapped('DRUGE ALTERNATIVE ZDRAVLJENJA:', boldFont, 13);
  drawWrapped('• Brušenje zob in izdelava mostu (kovinska osnova + keramika ali polna keramika, npr. cirkon).', regularFont, 12);
  drawWrapped('• Izdelava snemne proteze.', regularFont, 12);

  drawWrapped('MOŽNI ZAPLETI MED POSEGOM', boldFont, 13);
  const intra = [
    'Alergijska reakcija na anestetik ali druga zdravila',
    'Krvavitev',
    'Rahla do zmerna bolečina',
    'Nezmožnost vstavitve implantata zaradi slabe gostote kostnine, slabo pripravljenega ležišča ali drugih anatomskih nepravilnosti',
  ];
  for (const i of intra) drawWrapped('• ' + i, regularFont, 12);

  drawWrapped('MOŽNE KOMPLIKACIJE PO POSEGU', boldFont, 13);
  const post = [
    'Rahle do zmerne bolečine, krvavitev',
    'Parestezija živca, ki je prehodne narave (traja do 6 mesecev)',
    'Okužba rane',
    'Zavrnitev implantata',
    'Oteklina obraza',
    'Modrice na koži',
    'V primeru predrtja sinusa je možen akutni ali kronični sinusitis',
  ];
  for (const p of post) drawWrapped('• ' + p, regularFont, 12);

  drawWrapped('VZDRŽEVANJE RANE PO POSEGU', boldFont, 13);
  drawWrapped('Potrebna je kompresija z zložencem minimalno 30 minut do 1 ure. Spiranje ust z ustno vodo (curasept) 3 do 5 krat na dan. Ali spiranjem z žajblovim ali kamiličnim čajem (ki je predhodno ohlajen). Štirinajst dni se Izogibate vroči, trdi hrani ter gaziranim pijačam. Po rani ne ščetkate vsaj sedem dni. Redno jemanje antibiotikov in protibolečinskih tablet, v kolikor vam je predpisal zobozdravnik. Prvo leto po posegu je pregled čez 6 mesecev in nato vsako leto enkrat, kjer se opravi slikanje zobovja in preveri stabilnost implantata. V kolikor zamudite, ali ignorirate redne preglede, je možnost neuspeha večja, zakar NE ODGOVARJAMO. Implantat se osteointegrira v 90 dneh od posega. Začetek protetičnega dela na implantatih je minimalno 90 dni od posega.', regularFont, 12);

  drawWrapped('S potrditvijo tega obrazca izjavljam, da sem prebral izjavo pred posegom, da mi je bilo vse razumljivo in razloženo. Da se zavedam komplikacij med in po posegu.', regularFont, 12);

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
  drawWrapped('Build: multi-forms', regularFont, 9);

  return await pdfDoc.save();
}
