'use client';

import { useState, useEffect } from 'react';
import '../../globals.css';
import SignaturePad from '../../../components/SignaturePad';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png';

export default function ImplantPage(){
  const [docDate, setDocDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    setDocDate(fmt);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload: any = Object.fromEntries(data.entries());
    payload.signature = signature;

    try{
      const res = await fetch('/api/submit', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      const json = await res.json();
      if(json.ok){
        const toPatient = !!payload.email && String(payload.email).trim().length > 0;
        form.reset();
        window.location.href = toPatient ? '/uspeh?patient=1' : '/uspeh?patient=0';
      }else{
        alert(json.message || 'Napaka pri pošiljanju.');
      }
    }catch(err:any){
      alert(err?.message || 'Napaka pri pošiljanju.');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <img className="logo" alt="Logo ordinacije" src={LOGO_URL} />
          <div><h1>IZJAVA PRED IMPLANTOLOŠKIM POSEGOM</h1></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="formType" value="implant" />
          <div className="small"><a href="/obrazci">← Nazaj na izbor obrazcev</a></div>

          <p>Spoštovani pacijent/ka, tale obrazec je namenjen temu, da povzamemo kar smo se pogovarjali tekom pregleda in da prostovoljno privolite v poseg, ki je načrtovan.</p>

          <label>Datum dokumenta *</label>
          <input name="docDate" type="text" required placeholder="npr. 7. januar 2019" value={docDate} onChange={(e)=>setDocDate(e.target.value)} />

          <label>Diagnoza *</label>
          <input name="diagnosis" type="text" required />

          <label>Ime in priimek zobozdravnika *</label>
          <input name="doctorName" type="text" required />

          <h2>Podatki pacienta</h2>
          <label>Ime in priimek *</label>
          <input name="fullName" type="text" required />

          <label>Elektronski naslov (neobvezno)</label>
          <input name="email" type="email" />

          <input type="hidden" name="doctorEmail" value="ebamatic@gmail.com" readOnly />

          <h2>Potek</h2>
          <p>Pred samim posegom prejmete 2g Amoksiklava ali 600 Klimicina (v kolikor so prisotne alergije na penicilin), protibolečinsko tableto NSAID ibuprofen 400mg ali drug analgetik v kolikor navedete alergije.</p>
          <label>V kolikor so prisotne alergije prosim navedite: *</label>
          <input name="allergies" type="text" required />

          <p>Postopek petek v lokalni anesteziji z zagotovljenim sterilnim delovnim poljem. Implantate ki vam jih vstavimo so narejeni iz zlitine zirkona in titana. Implantate ki jih vstavljamo so znanega italijanskega proizvajalca Sweden & Martina in so trenutno vodilni v tehnologiji, prodaji in izdelavi implantatov v svetu.</p>

          <h2>Prednosti posega</h2>
          <ul>
            <li>Možnost nadomeščanja enega ali več zobov, brez brušenja ostalih zobov, s fiksnim izdelkom.</li>
          </ul>

          <h2>Druge alternative zdravljenja</h2>
          <ul>
            <li>Brušenje zob in izdelava mostu (kovinska osnova + keramika ali polna keramika, npr. cirkon).</li>
            <li>Izdelava snemne proteze.</li>
          </ul>

          <h2>Možni zapleti med posegom</h2>
          <ul>
            <li>Alergijska reakcija na anestetik ali druga zdravila</li>
            <li>Krvavitev</li>
            <li>Rahla do zmerna bolečina</li>
            <li>Nezmožnost vstavitve implantata zaradi slabe gostote kostnine, slabo pripravljenega ležišča ali drugih anatomskih nepravilnosti</li>
          </ul>

          <h2>Možne komplikacije po posegu</h2>
          <ul>
            <li>Rahle do zmerne bolečine, krvavitev</li>
            <li>Parestezija živca, ki je prehodne narave (traja do 6 mesecev)</li>
            <li>Okužba rane</li>
            <li>Zavrnitev implantata</li>
            <li>Oteklina obraza</li>
            <li>Modrice na koži</li>
            <li>V primeru predrtja sinusa je možen akutni ali kronični sinusitis</li>
          </ul>

          <h2>Vzdrževanje rane po posegu</h2>
          <p>Potrebna je kompresija z zložencem minimalno 30 minut do 1 ure. Spiranje ust z ustno vodo (curasept) 3 do 5 krat na dan. Ali spiranjem z žajblovim ali kamiličnim čajem (ki je predhodno ohlajen). Štirinajst dni se Izogibate vroči, trdi hrani ter gaziranim pijačam. Po rani ne ščetkate vsaj sedem dni. Redno jemanje antibiotikov in protibolečinskih tablet, v kolikor vam je predpisal zobozdravnik. Prvo leto po posegu je pregled čez 6 mesecev in nato vsako leto enkrat, kjer se opravi slikanje zobovja in preveri stabilnost implantata. V kolikor zamudite, ali ignorirate redne preglede, je možnost neuspeha večja, zakar NE ODGOVARJAMO. Implantat se osteointegrira v 90 dneh od posega. Začetek protetičnega dela na implantatih je minimalno 90 dni od posega.</p>

          <p>S potrditvijo tega obrazca izjavljam, da sem prebral izjavo pred posegom, da mi je bilo vse razumljivo in razloženo. Da se zavedam komplikacij med in po posegu.</p>

          <label>Vaša vprašanja? (če jih nimate napišite: "nimam vprašanj") *</label>
          <input name="questions" type="text" required />

          <h2>Podpis</h2>
          <SignaturePad value={signature} onChange={setSignature} />
          <div className="small">S podpisom potrjujem navedbe in se strinjam z opisanim posegom.</div>

          <div style={{ marginTop: 16 }}>
            <button className="button" type="submit" disabled={loading || !signature}>
              {loading ? 'Pošiljanje...' : 'Oddaj in pošlji PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
