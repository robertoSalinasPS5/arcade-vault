// Mock de persistencia en localStorage, con las mismas claves que el prototipo.
// Todo acceso va en try/catch: si localStorage no está disponible (modo privado,
// bloqueado, servidor), la app sigue funcionando sin persistir.

export type User = { name: string }; // mayúsculas, máx. 10 caracteres
export type ScoreEntry = { game: string; score: number; name: string; at: number }; // at = Date.now()

export const USER_KEY = "av_user";
export const SCORES_KEY = "av_scores";

/** Texto crudo de av_user, o null si no hay sesión o no se puede leer. */
export function readUserRaw(): string | null {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (data && typeof data === "object" && typeof (data as User).name === "string") {
      return { name: (data as User).name };
    }
  } catch {}
  return null;
}

export function writeUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

export function appendScore(entry: Omit<ScoreEntry, "at">): void {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const all = Array.isArray(parsed) ? (parsed as ScoreEntry[]) : [];
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {}
}
