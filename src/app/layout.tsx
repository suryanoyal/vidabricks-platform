import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Agents | Vidabricks',
  description:
    'Official digital business card platform for Vidabricks Real Estate, Dubai. Connect directly with certified luxury property consultants and off-plan investment specialists.',
  keywords: [
    'Vidabricks Real Estate',
    'Dubai Real Estate Brokers',
    'Off-Plan Dubai',
    'Palm Jumeirah Real Estate',
    'Dubai Luxury Penthouses',
    'RERA Certified Dubai Agents',
    'Digital Real Estate Business Card',
  ],
  authors: [{ name: 'Vidabricks Real Estate LLC' }],
  creator: 'Vidabricks Real Estate Dubai',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Agents | Vidabricks',
    description:
      'Connect with certified luxury real estate brokers in Dubai. Instant WhatsApp contact, verified RERA credentials, and curated property portfolios.',
    url: 'https://agents.vidabricks.com',
    siteName: 'Vidabricks Real Estate',
    images: [
      {
        url: 'https://vidabricks.com/wp-content/uploads/vidabricks-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Vidabricks Real Estate Dubai',
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-vb-dark text-white selection:bg-vb-gold selection:text-vb-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
