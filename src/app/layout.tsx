import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const dmSerif = DM_Serif_Display({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
    title: 'QuantForecast® | Sequential Hybrid Model',
    description: 'A Hybrid ARIMA-GARCH-LSTM Sequential Framework for KES/CAD Forecasting.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
