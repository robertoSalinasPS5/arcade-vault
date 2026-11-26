"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useUser } from "@/components/user-provider";

type Section = "biblioteca" | "salon" | "acceso";

// Biblioteca abarca también el detalle y el reproductor (/juegos/*).
function activeSection(pathname: string | null): Section | null {
  if (!pathname) return null;
  if (pathname === "/" || pathname.startsWith("/juegos/")) return "biblioteca";
  if (pathname === "/salon") return "salon";
  if (pathname === "/acceso") return "acceso";
  return null;
}

function NavView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useUser();
  const active = activeSection(pathname);
  const cls = (s: Section) => (active === s ? "active" : undefined);
  const close = () => setOpen(false);

  // Esc cierra el panel móvil.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close} aria-label="Arcade Vault, ir a la biblioteca">
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls("biblioteca")}>Biblioteca</Link>
          <Link href="/salon" className={cls("salon")}>Salón de la Fama</Link>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button type="button" className="btn ghost auth-btn" onClick={logout} title="Cerrar sesión">
            {user.name} ▾
          </button>
        ) : (
          <Link href="/acceso" className="btn auth-btn">Iniciar Sesión</Link>
        )}
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
          aria-expanded={open}
          aria-controls="av-mobile-panel"
        >
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close} aria-hidden="true" />
      <aside id="av-mobile-panel" className={"av-mobile-panel" + (open ? " open" : "")} inert={!open}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>MENÚ</div>
        <Link href="/" className={cls("biblioteca")} onClick={close}>Biblioteca</Link>
        <Link href="/salon" className={cls("salon")} onClick={close}>Salón de la Fama</Link>
        <Link href="/acceso" className={cls("acceso")} onClick={close}>{user ? "Cuenta" : "Iniciar Sesión"}</Link>
        <div style={{ flex: 1 }} />
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}

function NavWithPathname() {
  return <NavView pathname={usePathname()} />;
}

// Con cacheComponents, usePathname() suspende en rutas con params no conocidos
// en build; el fallback pinta la misma barra sin enlace activo.
export function Nav() {
  return (
    <Suspense fallback={<NavView pathname={null} />}>
      <NavWithPathname />
    </Suspense>
  );
}
