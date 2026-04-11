export function formatDateTime(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export function startOfDayISO(dateYYYYMMDD: string) {
  // "2026-04-10" -> ISO start
  return new Date(dateYYYYMMDD + 'T00:00:00.000').toISOString();
}

export function endOfDayISO(dateYYYYMMDD: string) {
  return new Date(dateYYYYMMDD + 'T23:59:59.999').toISOString();
}