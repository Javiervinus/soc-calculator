export function getGuayaquilTime(): Date {
  const now = new Date();
  const guayaquilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
  return guayaquilTime;
}

export function formatGuayaquilTime(date: Date): string {
  return date.toLocaleTimeString('es-EC', {
    timeZone: 'America/Guayaquil',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function formatGuayaquilDateTime(date: Date): string {
  return date.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}