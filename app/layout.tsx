import type { Metadata } from "next";
import { Courier_Prime, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { Nav } from "@/components/nav";
import { UserProvider } from "@/components/user-provider";
import "./globals.css";

// Mismas fuentes que references/templates, auto-hospedadas por next/font.
// globals.css las consume vía --pixel y --mono.
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// Solo es fallback de --mono: no hace falta precargarla.
const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier-prime",
  preload: false,
});

export const metadata: Metadata = {
  title: "Arcade Vault · Portal Retro",
  description: "Plataforma para jugar online y competir por la mayor cantidad de puntos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${pressStart2P.variable} ${jetbrainsMono.variable} ${courierPrime.variable}`}
    >
      <body>
        <div className="av-bg" aria-hidden="true" />
        <div className="av-noise" aria-hidden="true" />
        <div className="av-root">
          <UserProvider>
            <Nav />
            <main className="av-main">{children}</main>
            <footer className="border-t border-line px-8 py-5 text-center font-mono text-[11px] tracking-[0.16em] text-ink-faint">
              © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
            </footer>
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
