'use client';

import { useState, useEffect } from 'react';
import '../../globals.css';
import SignaturePad from '../../../components/SignaturePad';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png';

export default function EkstrakcijaPage(){
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
          <div><h1>OBRAZEC ZA PRISTANEK NA EKSTRAKCIJO ZOBA/OBRAVNAVO</h1></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="formType" value="ekstrakcija" />
          <input type="hidden" name="doctorEmail" value="ebamatic@gmail.com" readOnly />
          <div className="small"><a href="/obrazci">← Nazaj na izbor obrazcev</a></div>

          <label>Datum *</label>
          <input name="docDate" type="text" required placeholder="npr. 7. januar 2019" value={docDate} onChange={(e)=>setDocDate(e.target.value)} />

          <label>Ime in priimek zobozdravnika *</label>
          <input name="doctorName" type="text" required />

          <h2>Podatki o zobu za ekstrakcijo</h2>
          <label>Lokacija zoba</label>
          <input name="toothLocation" type="text" placeholder="npr. zgoraj levo, spodaj desno" />

          <label>Številka zoba (po zobozdravstvenem diagramu)</label>
          <input name="toothNumber" type="text" />

          <h2>Pacientovi podatki</h2>
          <label>Ime in priimek *</label>
          <input name="fullName" type="text" required />

          <label>Elektronski naslov (neobvezno)</label>
          <input name="email" type="email" />

          <label>Datum rojstva *</label>
          <input name="dob" type="text" required placeholder="DD.MM.LLLL" />

          <label>Kontaktna telefonska številka *</label>
          <input name="phone" type="text" required />

          <h2>Opis posega</h2>
          <p>Ekstrakcija zoba je kirurški postopek odstranjevanja zoba iz ustne votline. Postopek se izvaja pod lokalno anestezijo in vključuje odstranjevanje zoba ter, če je potrebno, čiščenje in šivanje rane.</p>

          <h2>Možna tveganja in zapleti</h2>
          <p>Kljub strokovnosti in ustrezni oskrbi obstajajo naslednja tveganja:</p>
          <ul>
            <li>Krvavitve</li>
            <li>Okužbe</li>
            <li>Otekanje in bolečina</li>
            <li>Poškodbe sosednjih zob ali struktur</li>
            <li>Zapleti zaradi anestezije</li>
          </ul>
          <p>Če imate vprašanja ali posebne skrbi, prosimo, da se posvetujete z zobozdravnikom.</p>

          <h2>Izjave</h2>
          <ul>
            <li>Da sem bil/-a ustrezno obveščen/-a o poteku posega, možnih tveganjih in zapletih.</li>
            <li>Da sem imel/-a možnost postaviti vprašanja in so mi bila razumljivo pojasnjena.</li>
            <li>Da se prostovoljno strinjam z izvedbo posega.</li>
          </ul>

          <h2>Podpis</h2>
          <SignaturePad value={signature} onChange={setSignature} />
          <div className="small">S podpisom potrjujem navedbe in soglašam z ekstrakcijo zoba/obravnavo.</div>

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
