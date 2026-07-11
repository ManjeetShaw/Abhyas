import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("abhyas-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("abhyas-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
