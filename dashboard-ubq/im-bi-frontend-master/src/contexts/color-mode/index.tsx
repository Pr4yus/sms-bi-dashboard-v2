"use client";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { RefineThemes } from "@refinedev/mui";
import Cookies from "js-cookie";
import React, {
  createContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

type ColorModeContextType = {
  mode: string;
  setMode: () => void;
};

type ColorModeContextProviderProps = {
  defaultMode?: string;
};

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: "light",
  setMode: () => undefined,
});

export const ColorModeContextProvider: React.FC<
  PropsWithChildren<ColorModeContextProviderProps>
> = ({ children, defaultMode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState(defaultMode || "light");

  const systemTheme = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const savedTheme = Cookies.get("theme");
      if (savedTheme) {
        setMode(savedTheme);
      } else {
        const newTheme = systemTheme ? "dark" : "light";
        setMode(newTheme);
        Cookies.set("theme", newTheme);
      }
    }
  }, [isMounted, systemTheme]);

  const toggleTheme = () => {
    const nextTheme = mode === "light" ? "dark" : "light";
    setMode(nextTheme);
    Cookies.set("theme", nextTheme, { sameSite: 'strict' });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <ColorModeContext.Provider
      value={{
        setMode: toggleTheme,
        mode,
      }}
    >
      <ThemeProvider
        theme={mode === "light" ? RefineThemes.Red : RefineThemes.RedDark}
      >
        <CssBaseline enableColorScheme />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
