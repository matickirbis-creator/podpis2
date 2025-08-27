'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import '../globals.css';
import Link from 'next/link';

function UspehContent() {
  const params = useSearchParams();
  const toPatient = params.get('patient') === '1';
  return (
    <>
      <h1>Uspeh 🎉</h1>
      <p style={{ marginTop: 8, fontSize: 18 }}>
        {toPatient
          ? 'Vaš obrazec je podpisan in poslan na vaš elektronski naslov.'
          : 'Vaš obrazec je podpisan in poslan v ordinacijo.'}
      </p>
      <div style={{ marginTop: 24 }}>
        <Link href="/obrazci" className="button">Izpolni nov obrazec</Link>
      </div>
    </>
  );
}

export default function UspehPage() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <Suspense fallback={<p>Nalaganje ...</p>}>
          <UspehContent />
        </Suspense>
      </div>
    </div>
  );
}
