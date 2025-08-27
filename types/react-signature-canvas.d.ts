declare module 'react-signature-canvas' {
  import * as React from 'react';
  export interface SignatureCanvasProps {
    penColor?: string;
    backgroundColor?: string;
    onEnd?: () => void;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  }
  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void;
    toDataURL(type?: string): string;
  }
}
