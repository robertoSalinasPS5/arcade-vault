"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useUser } from "@/components/user-provider";
import { GAMES, getGame, seededScores } from "@/lib/games";

const TOP_CLASS = ["top1", "top2", "top3"];
const fmt = (n: number) => n.toLocaleString("es-ES");

// La pestaña activa vive en ?juego=<id>; si falta o no existe, se usa el primer juego.
export function HallOfFame() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const game = getGame(searchParams.get("juego") ?? "") ?? GAMES[0];
  const rows = useMemo(() => seededScores(game.id.length * 23 + 7, 12), [game.id]);

  // Valores mock del prototipo para la fila "TU MEJOR MARCA".
  const youRank = Math.floor(8 + (game.id.length % 4));
  const youScore = rows[5].score - 2400;

  const selectGame = (id: string) => {
    router.replace(`${pathname}?juego=${id}`, { scroll: false });
  };

  return (
    <>
      <div className="hall-tabs" role="group" aria-label="Elegir juego">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (game.id === g.id ? " active" : "")}
            aria-pressed={game.id === g.id}
            onClick={() => selectGame(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{rows[1].name}</div>
          <div className="score">{fmt(rows[1].score)}</div>
          <div className="date">{rows[1].date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>CAMPEÓN</div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>01</div>
          <div className="name">{rows[0].name}</div>
          <div className="score" style={{ fontSize: 20 }}>{fmt(rows[0].score)}</div>
          <div className="date">{rows[0].date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{rows[2].name}</div>
          <div className="score">{fmt(rows[2].score)}</div>
          <div className="date">{rows[2].date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={game.id + r.name}
            className={["tr", TOP_CLASS[i]].filter(Boolean).join(" ")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{fmt(r.score)}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div className="tr you" style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
              <div className="rk" style={{ color: "var(--yellow)" }}>#{String(youRank).padStart(2, "0")}</div>
              <div className="pl" style={{ color: "var(--yellow)" }}>{user.name}</div>
              <div className="sc" style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}>
                {fmt(youScore)}
              </div>
              <div className="dt">11/05/2026</div>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </>
  );
}
