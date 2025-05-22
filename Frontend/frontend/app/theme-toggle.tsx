"use client";
import Boton, {  } from "../components/ui/boton";
import { useTheme } from "next-themes";
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return <Boton onClick={()=>setTheme(theme === "light" ? "dark" : "light")}></Boton>;
}
