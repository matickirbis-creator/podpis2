'use client';
import Link from 'next/link';
import '../globals.css';

export default function ObrazciPage(){
  return (
    <div className="container">
      <div className="card">
        <h1>Izberite obrazec</h1>
        <ul style={{fontSize:18, lineHeight: '1.8'}}>
          <li><Link className="button" href="/">Vprašalnik o zdravju (FDI)</Link></li>
          <li style={{marginTop:12}}><Link className="button" href="/obrazec/implant">Izjava pred implantološkim posegom</Link></li>
          <li style={{marginTop:12}}><Link className="button" href="/obrazec/protetika">Obrazec za privolitev pacienta – končano protetiko</Link></li>
          <li style={{marginTop:12}}><Link className="button" href="/obrazec/kirurski">Privolitev v kirurški oralni poseg</Link></li>
        </ul>
      </div>
    </div>
  );
}
