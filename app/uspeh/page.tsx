'use client';
import { useSearchParams } from 'next/navigation';
import '../globals.css';
import Link from 'next/link';

export default function UspehPage() {
  const params = useSearchParams();
  const toPatient = params.get('patient') === '1';
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>Uspeh 🎉</h1>
        <p style={{ marginTop: 8, fontSize: 18 }}>
          {toPatient
            ? 'Vaš obrazec je podpisan in poslan na vaš elektronski naslov.'
            : 'Vaš obrazec je podpisan in poslan v ordinacijo.'}
        </p>
        <div style={{ marginTop: 24 }}>
          <Link href="/" className="button">Izpolni nov obrazec</Link>
        </div>
      </div>
    </div>
  );
}
