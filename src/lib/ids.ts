let counter = 0;
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function tryFormat(dateIso: string): string {
  try {
    return new Date(dateIso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  } catch {
    return dateIso.slice(0, 10);
  }
}

export function formatTime(dateIso: string): string {
  try {
    return new Date(dateIso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
