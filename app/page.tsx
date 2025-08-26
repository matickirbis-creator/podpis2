'use client';

import { useState } from 'react';
import './globals.css';
import SignaturePad from '../components/SignaturePad';

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
    const payload = Object.fromEntries(data.entries());
    (payload as any).signature = signature;

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setResult(json);
      if (json.ok) form.reset();
    } catch (err:any) {
      setResult({ ok:false, message: err?.message || 'Napaka pri pošiljanju.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Obrazec – Izpolni in podpiši</h1>
        <form onSubmit={handleSubmit}>
          <div className="flex">
            <div style={{ flex: 1 }}>
              <label>Ime in priimek</label>
              <input name="fullName" type="text" required placeholder="Janez Novak" />
            </div>
            <div style={{ flex: 1 }}>
              <label>E-mail</label>
              <input name="email" type="email" required placeholder="janez@example.com" />
            </div>
          </div>

          <label>Datum rojstva</label>
          <input name="dob" type="text" placeholder="DD.MM.LLLL" />

          <label>Ali imate alergije na zdravila?</label>
          <select name="allergies">
            <option value="Ne">Ne</option>
            <option value="Da">Da</option>
          </select>

          <label>Ali jemljete redna zdravila?</label>
          <select name="medications">
            <option value="Ne">Ne</option>
            <option value="Da">Da</option>
          </select>

          <label>Dodatne informacije</label>
          <textarea name="notes" rows={4} placeholder="Poljubno"></textarea>

          <label>Podpis</label>
          <SignaturePad value={signature} onChange={setSignature} />
          <div className="small">S podpisom potrjujem točnost podatkov in soglašam z obdelavo osebnih podatkov za potrebe izvajanja zobozdravstvenih storitev.</div>

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
