const ES_CO = 'es-CO';

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatLongDate(date = new Date()) {
  return capitalize(
    date.toLocaleDateString(ES_CO, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );
}

export function formatDateTime(date = new Date()) {
  const day = date.toLocaleDateString(ES_CO, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString(ES_CO, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${capitalize(day)} · ${time}`;
}

export function formatShortDateTime(date: Date) {
  const day = date.toLocaleDateString(ES_CO, {
    day: '2-digit',
    month: 'short',
  });
  const time = date.toLocaleTimeString(ES_CO, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${capitalize(day.replace('.', ''))} · ${time}`;
}

export function formatRelativeTime(from: Date, base = new Date()) {
  const diffMs = base.getTime() - from.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.round(hours / 24);
  if (days === 1) {
    return `Ayer · ${from.toLocaleTimeString(ES_CO, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }
  if (days < 7) return `Hace ${days} días`;

  return from.toLocaleDateString(ES_CO, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getNextWeekday(targetWeekday: number, from = new Date()) {
  const next = new Date(from);
  next.setHours(0, 0, 0, 0);
  const delta = (targetWeekday - next.getDay() + 7) % 7 || 7;
  next.setDate(next.getDate() + delta);
  return next;
}
