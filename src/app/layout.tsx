import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import { ThemeProvider } from './components/ThemeProvider';
import { ColorThemeProvider } from './components/ColorThemeProvider';
import { cookies } from 'next/headers';
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const themeCookie = cookieStore.get('color-theme');
    
    // Default to 'teal' if no cookie is found, validate the theme matches our allowed list
    const validThemes = ['teal', 'mustard', 'green', 'magenta'];
    const resolvedTheme = themeCookie && validThemes.includes(themeCookie.value) 
        ? themeCookie.value as "teal" | "mustard" | "green" | "magenta"
        : 'teal';

    return (
        <html lang="en" className={`${inter.variable} ${dmSerif.variable} theme-scaled theme-${resolvedTheme}-scaled`} suppressHydrationWarning>
            <body className="antialiased dark:bg-[#121212] dark:text-white transition-colors duration-200">
                <ThemeProvider>
                    <ColorThemeProvider initialTheme={resolvedTheme}>
                        {children}
                    </ColorThemeProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
