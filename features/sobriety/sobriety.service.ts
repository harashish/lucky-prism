import { Sobriety, SobrietyRelapse, SobrietyWithMeta } from "./sobriety.repo";

// =========================
// TIME LOGIC (backend parity)
// =========================

export const calculateDuration = (s: Sobriety): number | null => {
  if (!s.started_at) return null;

  const start = new Date(s.started_at).getTime();

  if (s.is_active) {
    return Math.floor((Date.now() - start) / 1000);
  }

  if (s.ended_at) {
    const end = new Date(s.ended_at).getTime();
    return Math.floor((end - start) / 1000);
  }

  return null;
};

// =========================
// ENRICH
// =========================

export const enrichSobriety = (
  s: Sobriety,
  relapses: SobrietyRelapse[]
): SobrietyWithMeta => {
  return {
    ...s,
    relapses,
    current_duration: calculateDuration(s),
  };
};

// =========================
// SORT / HELPERS
// =========================

export const getActiveSobriety = (list: Sobriety[]): Sobriety | null => {
  return list.find((s) => s.is_active === 1) ?? null;
};

// optional later
export const sortByCreated = (list: Sobriety[]) => {
  return [...list].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );
};