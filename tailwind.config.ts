// tailwind.config.ts
import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: {
          '0%, 100%': { filter: 'brightness(0.5)' },
          '50%': { filter: 'brightness(1.5)' },
        },
      },
      animation: {
        pulse: 'pulse 1s ease-in-out infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  
  darkMode: "class",
  plugins: [
    require("tailwindcss-animate"),
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#f9fafb",
              100: "#f3f4f6",
              200: "#e5e7eb",
              300: "#d1d5db",
              400: "#9ca3af",
              500: "#6b7280",
              600: "#4b5563",
              700: "#374151",
              800: "#1f2937",
              900: "#111827",
              DEFAULT: "#6b7280",
              foreground: "#000000"
            },
            secondary: {
              50: "#e6f6e9",
              100: "#c4e8c9",
              200: "#9ed9a6",
              300: "#75cb82",
              400: "#53c067",
              500: "#2eb44b",
              600: "#24a542",
              700: "#159337",
              800: "#02822c",
              900: "#006317",
              DEFAULT: "#24a542",
              foreground: "#000000"
            },
            danger: {
              50: "#ffe9eb",
              100: "#ffc7cb",
              200: "#fa8f8c",
              300: "#f2615e",
              400: "#fb3333",
              500: "#ff0505",
              600: "#f1000c",
              700: "#df0007",
              800: "#d30000",
              900: "#c60000",
              DEFAULT: "#ff0505"
            },
            focus: "#00FF00",
          },
        },
        dark: {
          colors: {
            primary: {
              50: "#f9fafb",
              100: "#f3f4f6",
              200: "#e5e7eb",
              300: "#d1d5db",
              400: "#9ca3af",
              500: "#6b7280",
              600: "#4b5563",
              700: "#374151",
              800: "#1f2937",
              900: "#111827",
              DEFAULT: "#6b7280",
              foreground: "#FFFFFF"
            },
            secondary: {
              50: "#e6f6e9",
              100: "#c4e8c9",
              200: "#9ed9a6",
              300: "#75cb82",
              400: "#53c067",
              500: "#2eb44b",
              600: "#24a542",
              700: "#159337",
              800: "#02822c",
              900: "#006317",
              DEFAULT: "#24a542",
              foreground: "#FFFFFF"
            },
          },
        },
      },
    }),
  ],
} satisfies Config

export default config