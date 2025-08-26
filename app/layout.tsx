export const metadata = {
  title: 'Ordinacija – Obrazec s podpisom',
  description: 'Izpolni obrazec, podpiši na tablici, prejmi PDF na e-mail.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl">
      <body>
        {children}
      </body>
    </html>
  );
}
