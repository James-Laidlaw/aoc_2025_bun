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

  const input = readInput("07", runTypeArg === "full");

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

enum tile_state {
  EMPTY,
  BEAM,
  SPLITTER,
}

type ParsedInput = tile_state[][];
function parseInput(inputString: string): ParsedInput {
  const rowStrings = inputString.split("\n");

  const rows = rowStrings.map((rowString) => {
    const rowChars = rowString.split("");
    return rowChars.map((char) => {
      if (char == ".") return tile_state.EMPTY;
      if (char == "S") return tile_state.BEAM;
      if (char == "^") return tile_state.SPLITTER;
      throw new Error("unexpected character encounetered");
    });
  });

  return rows;
}

function solve1(input: ParsedInput): void {
  let splitCount = 0;

  for (let i = 0; i < input.length - 1; i++) {
    for (let j = 0; j < input.length - 1; j++) {
      if (input[i][j] === tile_state.BEAM) {
        if (input[i + 1][j] === tile_state.EMPTY) {
          input[i + 1][j] = tile_state.BEAM;
        } else if (input[i + 1][j] == tile_state.SPLITTER) {
          splitCount++;
          if (j > 0) {
            input[i + 1][j - 1] = tile_state.BEAM;
          }

          if (j < input[i + 1].length - 1) {
            input[i + 1][j + 1] = tile_state.BEAM;
          }
        }
      }
    }
  }

  console.log(splitCount);
}

function solve2(input: ParsedInput): void {
  const beamIndex = input[0].findIndex((tile) => tile === tile_state.BEAM);
  const universeCount = getPossibilityCount(0, beamIndex, input);

  console.log(universeCount);
}

const DPMatrix = [] as number[][];

function getPossibilityCount(
  currentRowIdx: number,
  beamIdx: number,
  inputGrid: ParsedInput
): number {
  if (DPMatrix[currentRowIdx]?.[beamIdx] != undefined) {
    return DPMatrix[currentRowIdx][beamIdx];
  }

  if (currentRowIdx >= inputGrid.length - 1) {
    if (DPMatrix[currentRowIdx] == undefined) {
      DPMatrix[currentRowIdx] = [];
    }
    DPMatrix[currentRowIdx][beamIdx] = 1;
    return 1;
  }

  const tileBelowBeam = inputGrid[currentRowIdx + 1][beamIdx];

  if (tileBelowBeam === tile_state.EMPTY) {
    const possibilityCount = getPossibilityCount(
      currentRowIdx + 1,
      beamIdx,
      inputGrid
    );

    if (DPMatrix[currentRowIdx] == undefined) {
      DPMatrix[currentRowIdx] = [];
    }
    DPMatrix[currentRowIdx][beamIdx] = possibilityCount;
    return possibilityCount;
  }

  if (tileBelowBeam === tile_state.SPLITTER) {
    const possibilityCount =
      getPossibilityCount(currentRowIdx + 1, beamIdx - 1, inputGrid) +
      getPossibilityCount(currentRowIdx + 1, beamIdx + 1, inputGrid);

    if (DPMatrix[currentRowIdx] == undefined) {
      DPMatrix[currentRowIdx] = [];
    }
    DPMatrix[currentRowIdx][beamIdx] = possibilityCount;
    return possibilityCount
  }
  throw new Error("we shouldn't get here");
}

main();
