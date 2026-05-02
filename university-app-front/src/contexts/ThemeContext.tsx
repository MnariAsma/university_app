import { createContext, useState, useMemo } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  // Load saved theme or default to light
  const storedTheme = localStorage.getItem("appMode") as "light" | "dark" | null;
  const [mode, setMode] = useState<"light" | "dark">(storedTheme || "light");

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === "light" ? "dark" : "light";
        localStorage.setItem("appMode", newMode);
        return newMode;
      });
    },
  }), []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'dark' ? {
        // --- Midnight Blue ("Bleu Nuit") Modern Dark Theme ---
        primary: { main: '#38bdf8' }, // High contrast sky blue
        secondary: { main: '#a855f7' }, // Purple accent
        background: {
          default: '#020617', // Deep midnight blue for the app background
          paper: '#0f172a',  // Lighter midnight blue for cards/panels
        },
        text: {
          primary: '#f1f5f9', // Crisp white/blueish text
          secondary: '#94a3b8',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
      } : {
        // --- Standard Light Theme ---
        primary: { main: '#2563eb' },
        secondary: { main: '#8b5cf6' },
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#0f172a', secondary: '#64748b' },
        divider: 'rgba(0, 0, 0, 0.08)',
      }),
    },
    shape: { 
      borderRadius: 16 
    },
    typography: { 
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      button: { textTransform: 'none', fontWeight: 600 }
    },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
