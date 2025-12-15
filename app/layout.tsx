import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gong Call Summary Agent',
  description: 'AI-powered call summary agent using Vercel Sandbox',
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

