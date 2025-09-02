'use client';
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type Props = { value: string | null; onChange: (v: string|null)=>void; height?: number };

export default function SignaturePad({ value, onChange, height=160 }: Props){
  const ref = useRef<any>(null);
  const clear = () => { ref.current?.clear(); onChange(null); };
  const save = () => {
    if(ref.current && typeof ref.current.isEmpty === 'function' && !ref.current.isEmpty()){
      onChange(ref.current.toDataURL('image/png'));
    }
  };
  return (
    <div>
      <div style={{background:'#fff', border:'1px solid #ddd', borderRadius:12, padding:6}}>
        <SignatureCanvas ref={(c)=>ref.current=c} penColor="black" canvasProps={{width:800,height,style:{width:'100%',height}}} onEnd={save} />
      </div>
      <div className="small">
        Podpišite se s prstom ali pisalom. <a href="#" onClick={(e)=>{e.preventDefault(); clear();}}>Počisti</a>
      </div>
    </div>
  );
}
