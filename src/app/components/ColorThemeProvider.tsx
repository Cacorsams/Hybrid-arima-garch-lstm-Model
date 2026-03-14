'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ColorTheme = 'teal' | 'mustard' | 'green' | 'magenta';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({
  children,
  initialTheme = 'teal',
}: {
  children: React.ReactNode;
  initialTheme?: ColorTheme;
}) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(initialTheme);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    
    // Set cookie for server-side persistence (max-age 1 year)
    document.cookie = `color-theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Update HTML class immediately to prevent FOUC during client-side navigation
    const html = document.documentElement;
    
    // Remove all existing color theme classes
    html.classList.remove('theme-teal-scaled', 'theme-mustard-scaled', 'theme-green-scaled', 'theme-magenta-scaled');
    
    // Add the new selected class
    html.classList.add(`theme-${theme}-scaled`);
  };

  // Optional: Sync with cookie if it changes in another tab
  useEffect(() => {
    const handleCookieChange = () => {
      const match = document.cookie.match(new RegExp('(^| )color-theme=([^;]+)'));
      if (match && match[2] && match[2] !== colorTheme) {
        setColorThemeState(match[2] as ColorTheme);
        
        const html = document.documentElement;
        html.classList.remove('theme-teal-scaled', 'theme-mustard-scaled', 'theme-green-scaled', 'theme-magenta-scaled');
        html.classList.add(`theme-${match[2]}-scaled`);
      }
    };

    window.addEventListener('storage', handleCookieChange); // storage event handles changes across tabs
    return () => window.removeEventListener('storage', handleCookieChange);
  }, [colorTheme]);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}
