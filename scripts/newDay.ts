import { mkdirSync, existsSync, writeFileSync, readFileSync } from "fs";

const dayArg = process.argv[2];
if (!dayArg) {
  console.error("Usage: bun run scripts/newDay.ts <day>");
  process.exit(1);
}

const day = String(dayArg).padStart(2, "0");

const src = `src/day${day}.ts`;
const input = `inputs/day${day}.txt`;
const inputDemo = `inputs/day${day}demo.txt`;

if (!existsSync("src")) mkdirSync("src");
if (!existsSync("inputs")) mkdirSync("inputs");

const templateDayPath = "scripts/templateDay.ts";
if (!existsSync(templateDayPath)) throw new Error("template day not found!");

const templateDayContents = readFileSync(templateDayPath, {
  encoding: "utf-8",
});
const processedDayContents = templateDayContents.replaceAll("$$$DAYPLACEHOLDER$$$", `"${day}"`);

if (!existsSync(src)) {
  writeFileSync(src, processedDayContents);
  console.log("Created:", src);
}

if (!existsSync(input)) {
  writeFileSync(input, "");
  console.log("Created:", input);
}

if (!existsSync(inputDemo)) {
  writeFileSync(inputDemo, "");
  console.log("Created:", inputDemo);
}