'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import '../globals.css';

function UspehContent(){
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const sentToPatient = params.get('patient') === '1';
  return (
    <div className="container">
      <div className="card">
        <h1>Uspeh</h1>
        <p>Vaš obrazec je podpisan in poslan {sentToPatient ? 'na vaš elektronski naslov in' : ''} na e-mail ordinacije.</p>
        <Link href="/obrazci" className="button">Izpolni nov obrazec</Link>
      </div>
    </div>
  );
}

export default function Page(){
  return <Suspense fallback={"Nalaganje..."}><UspehContent/></Suspense>;
}
