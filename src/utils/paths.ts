import { join } from "node:path";
import { homedir } from "node:os";
import { APP_NAME } from "./constants";

export function appDir(): string {
  if (process.platform === "win32") {
    const appdata = process.env.APPDATA;
    if (appdata) return join(appdata, APP_NAME);
  }
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg) return join(xdg, APP_NAME);
  return join(homedir(), ".config", APP_NAME);
}

export function appFile(name: string): string {
  return join(appDir(), name);
}