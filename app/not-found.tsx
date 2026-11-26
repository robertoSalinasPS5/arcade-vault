import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pantalla no encontrada · Arcade Vault",
};

// Se usa con notFound() (ids de juego inexistentes) y para cualquier URL sin ruta.
export default function NotFound() {
  return (
    <section className="fade-in mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <div className="pixel neon-magenta flicker text-[clamp(56px,14vw,112px)]" aria-hidden="true">
        404
      </div>
      <h1 className="pixel neon-cyan mt-8 mb-0 text-[clamp(14px,3vw,20px)]">PANTALLA NO ENCONTRADA</h1>
      <p className="mt-5 mb-10 text-ink-dim">
        Esta dirección no lleva a ningún juego del vault. Puede que el enlace esté mal escrito o que el
        juego ya no esté disponible.
      </p>
      <Link href="/" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </section>
  );
}
