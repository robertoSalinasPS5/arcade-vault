"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { AccentColor, Game } from "@/lib/games";

// Variante de botón según el color de acento (cyan y green usan el botón por defecto).
const BTN_BY_COLOR: Partial<Record<AccentColor, string>> = { magenta: "magenta", yellow: "yellow" };

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function GameCard({ game }: { game: Game }) {
  const router = useRouter();
  const tiltRef = useRef<HTMLDivElement>(null);
  const href = `/juegos/${game.id}`;

  const onMove = (e: React.MouseEvent) => {
    const el = tiltRef.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };
  const onLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  };

  return (
    // Toda la tarjeta es clicable con el ratón; con teclado se llega por el enlace JUGAR.
    <div ref={tiltRef} className="card" onMouseMove={onMove} onMouseLeave={onLeave} onClick={() => router.push(href)}>
      <div className="cover">
        <div className={"cover-bg " + game.cover} />
        <div className="label">{game.cat}</div>
      </div>
      <div className="meta">
        <div className="title">{game.title}</div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>MEJOR PUNTUACIÓN</span>
            <b>{game.best.toLocaleString("es-ES")}</b>
          </div>
          <Link
            href={href}
            className={["btn", BTN_BY_COLOR[game.color]].filter(Boolean).join(" ")}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Jugar a ${game.title}`}
          >
            JUGAR
          </Link>
        </div>
      </div>
    </div>
  );
}
