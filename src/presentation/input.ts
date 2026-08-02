export function promptText(label: string): string {
  return prompt(label) ?? "";
}

export function promptNumber(label: string): number {
  const input = prompt(label) ?? "";
  const n = Number.parseInt(input, 10);
  return Number.isNaN(n) ? NaN : n;
}

export function promptIndex(
  label: string,
  max: number,
): { idx: number; cancelled: boolean } {
  const input = prompt(label) ?? "";
  if (!input) return { idx: -1, cancelled: true };
  const n = Number.parseInt(input, 10);
  const idx = Number.isNaN(n) ? -1 : n - 1;
  return { idx, cancelled: false };
}