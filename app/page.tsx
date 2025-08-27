'use client';

import { useState } from 'react';
import './globals.css';
import SignaturePad from '../components/SignaturePad';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ok:boolean; message:string} | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

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
      setResult(json);
      if (json.ok) {
        const toPatient = !!payload.email && String(payload.email).trim().length > 0;
        form.reset();
        window.location.href = toPatient ? '/uspeh?patient=1' : '/uspeh?patient=0';
      }
    } catch (err:any) {
      setResult({ ok:false, message: err?.message || 'Napaka pri pošiljanju.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <img className="logo" alt="Logo ordinacije" src={LOGO_URL} />
          <div>
            <h1>Vprašalnik o zdravju po priporočilih FDI</h1>
            <div className="small center">Polja z * so obvezna</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex">
            <div style={{ flex: 1 }}>
              <label>Ime in priimek *</label>
              <input name="fullName" type="text" required placeholder="Janez Novak" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Email (neobvezno)</label>
              <input name="email" type="email" placeholder="janez@example.com" />
            </div>
          </div>

          <label>Če vprašalnik izpolnjuje druga oseba, vpišite ime in priimek</label>
          <input name="proxyName" type="text" placeholder="" />

          <div className="flex">
            <div style={{ flex: 1 }}>
              <label>Spol *</label>
              <select name="gender" required>
                <option value="">Izberi ...</option>
                <option value="Moški">Moški</option>
                <option value="Ženski">Ženski</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Datum rojstva *</label>
              <input name="dob" type="text" required placeholder="DD.MM.LLLL" />
            </div>
          </div>

          <div className="flex">
            <div style={{ flex: 1 }}>
              <label>Kontaktna številka *</label>
              <input name="phone" type="text" required placeholder="+386 ..." />
            </div>
            <div style={{ flex: 1 }}>
              <label>Naslov prebivališča *</label>
              <input name="address" type="text" required placeholder="Ulica 1, Kraj" />
            </div>
          </div>

          <label>E-mail ordinacije (prejemnik PDF)</label>
          <input name="doctorEmail" type="email" defaultValue="ebamatic@gmail.com" />

          <h2>Zdravstvena vprašanja</h2>
          <label>Ali bolehate za katero boleznijo? *</label>
          <select name="hasDisease" required>
            <option value="">Izberi ...</option>
            <option value="DA">DA</option>
            <option value="NE">NE</option>
          </select>

          <label>Če "DA" za katero?</label>
          <input name="diseaseName" type="text" />

          <label>Ali ste bili na operaciji v zadnjih dveh letih? *</label>
          <select name="hadSurgery" required>
            <option value="">Izberi ...</option>
            <option value="DA">DA</option>
            <option value="NE">NE</option>
          </select>

          <label>Če "DA" na kateri?</label>
          <input name="surgeryName" type="text" />

          <label>Ali jemljete zdravila? *</label>
          <select name="takesMeds" required>
            <option value="">Izberi ...</option>
            <option value="DA">DA</option>
            <option value="NE">NE</option>
          </select>

          <label>Katera?</label>
          <input name="medsList" type="text" />

          <label>Ali ste alergični na kakšno zdravilo, antibiotik ali snov? *</label>
          <select name="hasAllergy" required>
            <option value="">Izberi ...</option>
            <option value="DA">DA</option>
            <option value="NE">NE</option>
          </select>

          <label>Če "DA" na katero?</label>
          <input name="allergyName" type="text" />

          <label>Ali ste noseči? (odgovorijo ženske)</label>
          <select name="pregnant">
            <option value="">Izberi ...</option>
            <option value="DA">DA</option>
            <option value="NE">NE</option>
          </select>

          <label>Ste kadilec? *</label>
          <select name="smoker" required>
            <option value="">Izberi ...</option>
            <option value="DA">DA</option>
            <option value="NE">NE</option>
          </select>

          <label>Če "DA" koliko cigaret pokadite na dan?</label>
          <input name="cigsPerDay" type="text" />

          <h2>Izjave</h2>
          <p className="small">
            S podpisom potrjujem in se strinjam z naslednjimi izjavami:
          </p>
          <ul style={{marginLeft: '18px'}}>
            <li>Pristanem na zobozdravniško zdravljenje ali protetično oskrbo na meni/mojem otroku, kot mi je predložil zobozdravnik.</li>
            <li>Pristanem na anestezijo.</li>
            <li>Seznanjen/a sem, da je uspeh posega odvisen od organizma, zobozdravnika, vrste posega in ravnanja bolnika pred/po posegu.</li>
            <li>Seznanjen/a sem, da je končni rezultat in učinek posega viden šele po 6–12 mesecih po posegu.</li>
            <li>Pristanem na fotografiranje ali snemanje zaradi medicinske dokumentacije.</li>
            <li>Pristanem na uporabo fotodokumentacije v medicinskoznanstvene, strokovne ali poučne namene, brez razkritja identitete.</li>
            <li>Izjavljam, da sem v pogovoru z zobozdravnikom dobil/a vse želene informacije o posegu, za katerega sem se prostovoljno odločil/a.</li>
            <li>Potrjujem, da sem s polnim razumevanjem in pri polni zavesti, svojevoljno podpisal/a to izjavo.</li>
          </ul>

          <h2>Podpis</h2>
          <SignaturePad value={signature} onChange={setSignature} />
          <div className="small">S podpisom potrjujem točnost podatkov in soglašam z obdelavo osebnih podatkov za potrebe zobozdravstvenih storitev.</div>

          <div style={{ marginTop: 16 }}>
            <button className="button" type="submit" disabled={loading || !signature}>
              {loading ? 'Pošiljanje...' : 'Oddaj in prejmi PDF na e-mail'}
            </button>
          </div>
        </form>

        {result && (
          <div className={result.ok ? 'success' : 'error'}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}
