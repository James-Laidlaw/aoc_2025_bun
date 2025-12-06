import { readInput } from "../src/utils/readInput";

function main() {
  const runPartArg = process.argv[2];
  const runTypeArg = process.argv[3];

  if (runPartArg !== "1" && runPartArg !== "2") {
    console.log("You need to specify if you're running part 1 or 2");
    return;
  }

  if (runTypeArg != "full") {
    console.log(
      "FYI you're second arg wasn't 'full' so I'm running the demo: ",
      runTypeArg
    );
  }

  const input = readInput("06", runTypeArg === "full");

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

type problem = { elements: string[]; operation: "*" | "+" };

type ParsedInput = problem[];

function parseInput(inputString: string): ParsedInput {
  // console.log("APARSING");
  const rows = inputString.split("\n");
  const problems: problem[] = [];

  const finalRow = rows[rows.length - 1];
  const ColStartIndexes: number[] = [];

  for (let idx = 0; idx < finalRow.length; idx++) {
    const currChar = finalRow[idx];
    if (currChar === "*" || currChar === "+") {
      ColStartIndexes.push(idx);
      problems.push({ elements: [], operation: currChar });
    }
  }
  // console.log("splits:", ColStartIndexes);
  rows.forEach((row, idx) => {
    if (idx === rows.length - 1) return;
    ColStartIndexes.forEach((colStartIndex, idx) => {
      problems[idx].elements.push(
        row.substring(
          colStartIndex,
          ColStartIndexes[idx + 1] !== undefined
            ? ColStartIndexes[idx + 1] - 1
            : undefined
        )
      );
    });
  });

  return problems as ParsedInput;
}

function solve1(input: ParsedInput): void {
  let sum = 0;
  input.forEach((problem) => {
    const operation =
      problem.operation === "*"
        ? (a: number, b: string) => a * parseInt(b.trim())
        : (a: number, b: string) => a + parseInt(b.trim());
    const startVal = problem.operation === "*" ? 1 : 0;
    sum += problem.elements.reduce(operation, startVal);
  });
  console.log(sum);
}

function cepalaphizeInput(unCepalaphizedIn: ParsedInput): void {
  unCepalaphizedIn.forEach((problem) => {
    const trueNumbers: string[] = [];

    const elementStrings = problem.elements.map((element) =>
      element.toString()
    );

    const maxLength = elementStrings.reduce(
      (prev, current) => Math.max(prev, current.length),
      elementStrings[0].length
    );

    for (let i = maxLength - 1; i >= 0; i--) {
      const digitChars = elementStrings.map((elementString) =>
        elementString.charAt(i)
      );

      const trueNumber = digitChars
        .filter((char) => char !== undefined && char !== "" && char !== " ")
        .join("");
      trueNumbers.push(trueNumber);
    }

    problem.elements = trueNumbers;
  });
}

function solve2(input: ParsedInput): void {
  cepalaphizeInput(input);
  solve1(input);
}

main();
