"use client";

import { useEffect, useId, useRef, useState } from "react";

// Formulario de contacto simulado, portado de references/templates/home-about/about.jsx.
// No envía ni guarda nada (SPEC 02): valida que haya texto y muestra la terminal de éxito.

type ContactDraft = { name: string; email: string; msg: string };

const EMPTY: ContactDraft = { name: "", email: "", msg: "" };
const SHAKE_MS = 400;

export function ContactForm() {
  const id = useId();
  const [form, setForm] = useState<ContactDraft>(EMPTY);
  // Nombre con el que se envió; null mientras se muestra el formulario.
  const [sent, setSent] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Si se sale de la página durante la animación, el temporizador no queda vivo.
  useEffect(() => () => {
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      setShake(true);
      shakeTimer.current = setTimeout(() => setShake(false), SHAKE_MS);
      return;
    }
    setSent(form.name.trim());
  };

  const reset = () => {
    setSent(null);
    setForm(EMPTY);
  };

  return (
    <form className={"contact-form" + (shake ? " shake" : "")} onSubmit={onSubmit}>
      {!sent ? (
        <>
          <div className="field">
            <label htmlFor={`${id}-name`}>NOMBRE</label>
            <input
              id={`${id}-name`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="px_kai"
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-email`}>CORREO ELECTRÓNICO</label>
            <input
              id={`${id}-email`}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jugador@vault.gg"
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-msg`}>MENSAJE</label>
            <textarea
              id={`${id}-msg`}
              rows={5}
              value={form.msg}
              onChange={(e) => setForm({ ...form, msg: e.target.value })}
              placeholder="Cuéntanos qué tienes en mente…"
            />
          </div>
          <button className="btn xl press" type="submit" style={{ width: "100%" }}>
            ▶  ENVIAR MENSAJE
          </button>
        </>
      ) : (
        <div className="terminal-success" role="status">
          <div className="term-bar">
            <span className="dot r" />
            <span className="dot y" />
            <span className="dot g" />
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {sent.toUpperCase()}.
              <span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={reset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
