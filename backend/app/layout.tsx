import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Media Factory API',
  description: 'Backend API server for Social Media Factory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}