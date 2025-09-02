'use client';

import { useState, useEffect } from 'react';
import '../../globals.css';
import SignaturePad from '../../../components/SignaturePad';

const LOGO_URL = 'https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png';

export default function KirurskiPage() {
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [procedureDate, setProcedureDate] = useState('');

  // Samodejni datum (sl-SI)
  useEffect(() => {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    setProcedureDate(fmt);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload: any = Object.fromEntries(data.entries());
    payload.signature = signature;
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        const toPatient = !!payload.email && String(payload.email).trim().length > 0;
        form.reset();
        window.location.href = toPatient ? '/uspeh?patient=1' : '/uspeh?patient=0';
      } else {
        alert(json.message || 'Napaka pri pošiljanju.');
      }
    } catch (err: any) {
      alert(err?.message || 'Napaka pri pošiljanju.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <img className="logo" alt="Logo ordinacije" src={LOGO_URL} />
          <div><h1>OBRAZEC ZA PRIVOLITEV V KIRURŠKI ORALNI POSEG</h1></div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <input type="hidden" name="formType" value="kirurski" />
          <input type="hidden" name="doctorEmail" value="ebamatic@gmail.com" readOnly />
          <div className="small"><a href="/obrazci">← Nazaj na izbor obrazcev</a></div>

          <label>Ime in priimek zobozdravnika/kirurga *</label>
          {/* Zdravnik ostane z omogočenim autocomplete */}
          <input name="doctorName" type="text" required />

          <label>Datum posega *</label>
          <input
            name="procedureDate"
            type="text"
            required
            placeholder="npr. 7. januar 2019"
            value={procedureDate}
            onChange={(e) => setProcedureDate(e.target.value)}
            autoComplete="off"
          />

          <label>Vrsta posega *</label>
          <input name="procedureType" type="text" required autoComplete="off" />

          <h2>Podatki pacienta</h2>
          <label>Ime in priimek *</label>
          <input name="fullName" type="text" required autoComplete="off" />

          <label>Elektronski naslov</label>
          <input name="email" type="email" autoComplete="off" />

          <label>Datum rojstva *</label>
          <input name="dob" type="text" required placeholder="DD.MM.LLLL" autoComplete="off" />

          <label>Telefonska številka *</label>
          <input name="phone" type="text" required autoComplete="off" />

          <h2>1. Opis posega:</h2>
          <p>Vaš zobozdravnik/kirurg vam je razložil naravo predlaganega posega, njegov namen in pričakovane koristi. Ta poseg vključuje:</p>

          <h2>2. Možna tveganja in zapleti:</h2>
          <p>Med posegom ali po njem lahko pride do naslednjih tveganj in zapletov, o katerih ste bili obveščeni:</p>
          <ul>
            <li>Bolečina, oteklina ali krvavitev</li>
            <li>Okužba</li>
            <li>Poškodba bližnjih tkiv ali struktur (živci, kosti, zobje)</li>
            <li>Anestezijske reakcije</li>
            <li>Morebitna potreba po dodatnih posegih</li>
          </ul>

          <h2>3. Alternativne možnosti:</h2>
          <p>Obveščen/a sem bil/a tudi o drugih možnostih zdravljenja, vključno z:</p>

          <h2>4. Anestezija:</h2>
          <p>Zdravnik mi je pojasnil vrste anestezije, ki bodo uporabljene med posegom, in možne stranske učinke.</p>

          <h2>5. Privolitev v poseg:</h2>
          <ul>
            <li>Razumem naravo posega, možna tveganja in koristi.</li>
            <li>Vem, da je uspešnost posega odvisna od številnih dejavnikov in da ni mogoče zagotoviti popolnega uspeha.</li>
            <li>Potrjujem, da sem imel/a možnost postavljati vprašanja in da so bila moja vprašanja ustrezno odgovorjena.</li>
          </ul>

          <h2>6. Odstop od privolitve:</h2>
          <p>Razumem, da lahko kadar koli pred posegom in vmes prekličem svojo privolitev brez posledic za mojo nadaljnjo oskrbo.</p>

          <p>S potrditvijo tega obrazca potrjujem, da sem prebral/a in razumel/a zgoraj navedene informacije ter da prostovoljno privolim v predlagani poseg.</p>

          <h2>Podpis</h2>
          <SignaturePad value={signature} onChange={setSignature} />
          <div className="small">S podpisom potrjujem navedbe in soglašam z navedenim kirurškim posegom.</div>

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
