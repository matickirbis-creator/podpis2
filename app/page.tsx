'use client';
import Link from 'next/link';
import './globals.css';

export default function Page(){
  return (
    <div className="container">
      <div className="card">
        <h1>Izberite obrazec</h1>
        <ul style={{fontSize:18, lineHeight: '2.0', listStyle:'none', padding:0}}>
          <li><Link className="button" href="/obrazec/fdi">Vprašalnik o zdravju (FDI)</Link></li>
          <li><Link className="button" href="/obrazec/implant">Izjava pred implantološkim posegom</Link></li>
          <li><Link className="button" href="/obrazec/protetika">Obrazec za privolitev pacienta – končano protetiko</Link></li>
          <li><Link className="button" href="/obrazec/kirurski">Privolitev v kirurški oralni poseg</Link></li>
        </ul>
      </div>
    </div>
  );
}
