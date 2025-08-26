'use client';

import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type Props = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
};

export default function SignaturePad({ value, onChange }: Props) {
  const ref = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    if (ref.current && value) {
      // keep state via parent
    }
  }, [value]);

  const clear = () => {
    (ref.current as any)?.clear();
    onChange(null);
  };

  const handleEnd = () => {
    const data = (ref.current as any)?.toDataURL('image/png');
    onChange(data || null);
  };

  return (
    <div>
      <SignatureCanvas
        ref={ref as any}
        penColor="black"
        backgroundColor="rgba(255,255,255,1)"
        onEnd={handleEnd}
        canvasProps={{ className: 'sigpad', width: 700, height: 220 }}
      />
      <div style={{ marginTop: 8 }}>
        <button type="button" className="button" onClick={clear}>Počisti podpis</button>
      </div>
      <div className="small">Podpis zberemo lokalno v brskalniku in pošljemo skupaj z obrazcem.</div>
    </div>
  );
}
