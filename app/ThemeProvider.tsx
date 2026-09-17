"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Oswald } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });

type Theme = "light" | "dark" | "tangerine" | "ocean" | "forest" | "slate";

type ThemeContextValue = {
	theme: Theme;
	setTheme: (t: Theme) => void;
	fontClass: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme";

export function ThemeProvider({
	children,
	defaultTheme = "ocean",
}: {
	children: React.ReactNode;
	defaultTheme?: Theme;
}) {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === "undefined") return defaultTheme;
		return (localStorage.getItem(STORAGE_KEY) as Theme) ?? defaultTheme;
	});

	useEffect(() => {
		const html = document.documentElement;
		// keep existing font classes + update theme
		html.className = `${oswald.className} ${theme}`;
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	return (
		<ThemeContext.Provider
			value={{ theme, setTheme, fontClass: oswald.className }}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
}
