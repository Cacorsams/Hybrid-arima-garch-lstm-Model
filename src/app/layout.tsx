import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import { ThemeProvider } from './components/ThemeProvider';
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
        <html lang="en" className={`${inter.variable} ${dmSerif.variable}`} suppressHydrationWarning>
            <body className="antialiased dark:bg-[#121212] dark:text-white transition-colors duration-200">
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
