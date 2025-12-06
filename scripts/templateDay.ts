import { readInput } from "../src/utils/readInput";

function main() {
  const runPartArg = process.argv[2];
  const runTypeArg = process.argv[3];

  if (runPartArg !== "1" && runPartArg !== "2") {
    console.log("You need to specify if you're running part 1 or 2");
    return;
  }

  if (runTypeArg != "full") {
    console.log("FYI you're second arg wasn't 'full' so I'm running the demo: ", runTypeArg);
  }

  const input = readInput($$$DAYPLACEHOLDER$$$, runTypeArg === "full");

  const parsedInput: ParsedInput = parseInput(input);

  if (runPartArg == "1") {
    console.log("starting part 1");
    doTimed(() => solve1(parsedInput));
  } else {
    console.log("starting part 2");
    doTimed(() => solve2(parsedInput));
  }
}

function doTimed(callback: () => void): void {
  const startTime = performance.now();
  callback();

  const endTime = performance.now();

  console.log(`Execution took ${endTime - startTime} milliseconds`);
}

//TODO this is populated with a demo from day 5
type ParsedInput = {
  freshRanges: { low: number; high: number }[];
  ingredients: number[];
};

//TODO this is populated with a demo from day 5
function parseInput(inputString: string): ParsedInput {
  const sections = inputString.split("\n\n");
  if (sections.length != 2) {
    throw new Error("input oops");
  }

  const rangesOutList: { low: number; high: number }[] = [];
  const rangeStrings = sections[0].split("\n");
  for (const rangeString of rangeStrings) {
    const [low, high] = rangeString.split("-");
    rangesOutList.push({ low: parseInt(low), high: parseInt(high) });
  }

  const ingredientsOutList = [];
  const ingredientStrings = sections[1].split("\n");
  for (const ingredientString of ingredientStrings) {
    ingredientsOutList.push(parseInt(ingredientString));
  }

  return { freshRanges: rangesOutList, ingredients: ingredientsOutList };
}

function solve1(input: ParsedInput): void {
  console.log("todo");
}

function solve2(input: ParsedInput): void {
  console.log("todo");
}

main();
