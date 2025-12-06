import { readFileSync } from "fs";

export function readInput(day: number | string, fullMode: boolean = false): string {
  const id = typeof day === "number" ? String(day).padStart(2, "0") : day;
  const modifier = fullMode ? '' : 'demo'
  return readFileSync(`inputs/day${id}${modifier}.txt`, "utf8").trimEnd();
}
