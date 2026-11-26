"use client";

import { useEffect } from "react";

// Hace aparecer los elementos .reveal de la página al entrar en pantalla, como el
// useReveal() de references/templates/home-about. No pinta nada: se monta una vez
// dentro de la página que tiene secciones .reveal.
// Con prefers-reduced-motion, globals.css ya los muestra sin esperar a esto.
export function RevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
