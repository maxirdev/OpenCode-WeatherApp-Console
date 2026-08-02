import { ok, err } from "../utils/colors";

export { ok, err };

export function printMessage(message: string): void {
  console.log(message.trimEnd());
}