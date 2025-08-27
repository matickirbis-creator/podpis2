'use client';

import { useState, useEffect } from 'react';
import '../../globals.css';
import SignaturePad from '../../../components/SignaturePad';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png';

export default function ProtetikaPage(){
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [docDate, setDocDate] = useState('');

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
          <div><h1>OBRAZEC ZA PRIVOLITEV PACIENTA - KONČANO PROTETIKO</h1></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="formType" value="protetika" />
          <input type="hidden" name="doctorEmail" value="ebamatic@gmail.com" readOnly />
          <div className="small"><a href="/obrazci">← Nazaj na izbor obrazcev</a></div>

          <p>Spoštovani/a pacient/ka, Zahvaljujemo se vam za zaupanje in sodelovanje pri izdelavi protetičnega nadomestka. Pred zaključkom postopka je pomembno, da ste seznanjeni z določenimi informacijami in podate privolitev za izvedbo protetične obravnave.</p>

          <label>Datum dokumenta *</label>
          <input name="docDate" type="text" required placeholder="npr. 7. januar 2019" value={docDate} onChange={(e)=>setDocDate(e.target.value)} />

          <label>Elektronski naslov *</label>
          <input name="email" type="email" required />

          <label>Ime in priimek *</label>
          <input name="fullName" type="text" required />

          <label>Datum rojstva *</label>
          <input name="dob" type="text" required placeholder="DD.MM.LLLL" />

          <label>Telefonska številka *</label>
          <input name="phone" type="text" required />

          <h2>Izjave</h2>
          <p>S tem obrazcem potrjujem, da sem bil/a:</p>
          <ul>
            <li>Seznanjen/a z diagnozo, predlaganim protetičnim zdravljenjem ter alternativnimi možnostmi, ki so mi bile razložene.</li>
            <li>Obveščen/a o prednostih in morebitnih tveganjih, povezanih s predlaganim zdravljenjem, vključno s komplikacijami, ki lahko nastanejo med ali po zdravljenju.</li>
            <li>Pojasnjen/a o potrebni skrbi za protetični nadomestek, rednem vzdrževanju ter preventivnih obiskih pri zobozdravniku za dolgoročno uspešnost zdravljenja.</li>
            <li>Zavedam se, da se estetika in funkcionalnost protetičnega nadomestka lahko razlikujeta glede na individualne anatomske in biološke značilnosti.</li>
          </ul>

          <p>S svojim podpisom potrjujem, da:</p>
          <ul>
            <li>Prostovoljno soglašam z dokončno izdelavo in vgradnjo protetičnega nadomestka.</li>
            <li>Razumem vse posredovane informacije in sem imel/a možnost postaviti dodatna vprašanja.</li>
            <li>Sem pripravljen/a sodelovati pri nadaljnjih postopkih in priporočilih za ustrezno uporabo protetičnega nadomestka.</li>
          </ul>

          <p>Garancija se upošteva ob rednih enoletnih pregledih, kjer se opravi slikovna dijagnostika in čiščenje mehkih in trdih blog. Na vso protetiko velja 2 letna garancija, kjer vam pokrijemo 100% nastalih stroškov. Po 2 ter vse do 5 let, v primeru težav, lomov ali drugih komplikacija vam krijemo 30% stroškov. Po 5 letih vse nastale stroške krije pacijent.</p>
          <p>Opomba: Če imate kakršnekoli dodatne pomisleke ali vprašanja, se obrnite na svojega zobozdravnika pred dokončno izdelavo protetičnega nadomestka.</p>
          <p>Hvala za vaše sodelovanje in zaupanje!</p>

          <h2>Podpis</h2>
          <SignaturePad value={signature} onChange={setSignature} />
          <div className="small">S podpisom potrjujem navedbe in soglašam s predlagano protetično obravnavo.</div>

          <div style={{ marginTop: 16 }}>
            <button className="button" type="submit" disabled={loading || !signature}>
              {loading ? 'Pošiljanje...' : 'Oddaj in pošlji PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
