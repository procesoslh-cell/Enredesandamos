export function money(value: number | null | undefined) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);
}

export function dateOnly(d: Date | string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR");
}

export function daysUntil(d: Date | string | null | undefined) {
  if (!d) return 0;
  const target = new Date(d);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
