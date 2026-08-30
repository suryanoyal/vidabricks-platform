import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Cormorant_Garamond } from 'next/font/google';
import '@/styles/globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

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
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${cormorant.variable} dark`}
    >
      <body className="bg-vb-dark text-white selection:bg-vb-gold selection:text-vb-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
