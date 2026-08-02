import pc from "picocolors";

export const cyan = pc.cyan;
export const yellow = pc.yellow;
export const green = pc.green;
export const red = pc.red;
export const dim = pc.dim;
export const bold = pc.bold;
export const blue = pc.blue;
export const magenta = pc.magenta;
export const reset = pc.reset;

export function ok(msg: string): string {
  return green(msg);
}

export function err(msg: string): string {
  return red(msg);
}

export function temp(value: number | string): string {
  return yellow(String(value));
}

export function title(msg: string): string {
  return cyan(bold(msg));
}

export function muted(msg: string): string {
  return dim(msg);
}