import type { Metadata } from "next";
import { Suspense } from "react";
import { HallOfFame } from "@/components/hall-of-fame";

export const metadata: Metadata = {
  title: "Salón de la Fama · Arcade Vault",
};

export default function SalonPage() {
  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA</p>
      </div>
      {/* useSearchParams() necesita Suspense para que el resto de la página se prerenderice.
          Sin fallback de datos: así nunca se ve un ranking que no corresponde a ?juego=. */}
      <Suspense fallback={null}>
        <HallOfFame />
      </Suspense>
    </div>
  );
}
