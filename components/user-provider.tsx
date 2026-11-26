"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
  appendScore,
  parseUser,
  readUserRaw,
  USER_KEY,
  writeUser,
  type ScoreEntry,
  type User,
} from "@/lib/storage";

type UserContextValue = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  saveScore: (entry: Omit<ScoreEntry, "at">) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

// Store externo sobre localStorage["av_user"].
// En el servidor y durante la hidratación el snapshot es null, así que el HTML
// del servidor y el primer render del cliente coinciden; justo después React
// relee el valor real (equivale a "leer av_user tras montar").
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Cambios hechos en otras pestañas.
  const onStorage = (e: StorageEvent) => {
    if (e.key === USER_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

const getServerSnapshot = () => null;

export function UserProvider({ children }: { children: React.ReactNode }) {
  // El snapshot es el texto crudo (estable entre lecturas); se parsea con useMemo.
  const raw = useSyncExternalStore(subscribe, readUserRaw, getServerSnapshot);
  const user = useMemo(() => parseUser(raw), [raw]);

  const login = useCallback((u: User) => {
    writeUser(u);
    notify();
  }, []);

  const logout = useCallback(() => {
    writeUser(null);
    notify();
  }, []);

  const saveScore = useCallback((entry: Omit<ScoreEntry, "at">) => {
    appendScore(entry);
  }, []);

  const value = useMemo(() => ({ user, login, logout, saveScore }), [user, login, logout, saveScore]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
