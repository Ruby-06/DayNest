export function localDateISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysInYear(year) {
  return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
}

export function formatLocalDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export function calculateStreak(entries = [], habits = []) {
  const activeDates = new Set();
  entries.forEach((e) => {
    if (e.date && (e.journalText?.trim() || e.mood || e.media?.length)) {
      activeDates.add(e.date);
    }
  });
  habits.forEach((h) => {
    (h.completedDates || []).forEach((d) => activeDates.add(d));
  });

  const today = new Date();
  let streak = 0;
  let curr = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Check today first, if not today check starting from yesterday
  const todayISO = localDateISO(curr);
  if (!activeDates.has(todayISO)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const iso = localDateISO(curr);
    if (activeDates.has(iso)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

