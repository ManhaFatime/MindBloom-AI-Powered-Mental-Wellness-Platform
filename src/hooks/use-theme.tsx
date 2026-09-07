import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "mindbloom-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === "dark" || stored === "light") {
    return stored;
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((nextTheme: Theme) => {
    const root = document.documentElement;

    if (nextTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const applyThemeInstantly = useCallback(
    (nextTheme: Theme) => {
      const root = document.documentElement;

      root.classList.add("theme-switch-instant");

      applyTheme(nextTheme);
      setThemeState(nextTheme);

      localStorage.setItem(STORAGE_KEY, nextTheme);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove("theme-switch-instant");
        });
      });
    },
    [applyTheme]
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = (event: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        const nextTheme = event.matches ? "dark" : "light";
        applyThemeInstantly(nextTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [applyThemeInstantly]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      applyThemeInstantly(nextTheme);
    },
    [applyThemeInstantly]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme =
      theme === "dark" ? "light" : "dark";

    applyThemeInstantly(nextTheme);
  }, [theme, applyThemeInstantly]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}