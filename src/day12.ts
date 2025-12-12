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

  const input = readInput("12", runTypeArg === "full");

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

type shape = boolean[][];
type areaSpec = { height: number; width: number; neededPresents: number[] };
type ParsedInput = {
  shapes: shape[];
  areas: areaSpec[];
};

function parseInput(inputString: string): ParsedInput {
  const sections = inputString.split("\n\n");

  const shapeStrings = sections.slice(0, 6);

  const shapeList: shape[] = [];

  for (const shapeString of shapeStrings) {
    const shapeStringSplit = shapeString.split("\n");
    const shape: shape = [];
    for (let i = 1; i < shapeStringSplit.length; i++) {
      const row = shapeStringSplit[i].split("").map((char) => char == "#");
      shape.push(row);
    }
    shapeList.push(shape);
  }

  const spaceStrings = sections[6].split("\n");
  const areas: areaSpec[] = [];

  for (const spaceString of spaceStrings) {
    const subsections = spaceString.split(": ");
    const dimensionSplit = subsections[0].split("x");
    const width = parseInt(dimensionSplit[0]);
    const height = parseInt(dimensionSplit[1]);

    const presentReq = subsections[1]
      .split(" ")
      .map((intString) => parseInt(intString));

    areas.push({ width, height, neededPresents: presentReq });
  }

  return { shapes: shapeList, areas: areas };
}


// I can't beleive this worked
function solve1(input: ParsedInput): void {
  const shapeVolumeMap: number[] = [];

  for (const shape of input.shapes) {
    let shapeVolume = shape.reduce(
      (prev, line) =>
        prev + line.reduce((prev, curr) => (curr ? prev + 1 : prev), 0),
      0
    );
    shapeVolumeMap.push(shapeVolume);
  }

  let count = 0;
  for (const space of input.areas) {
    const maxAvailableSpace = space.height * space.width;
    const neededSpace = space.neededPresents.reduce(
      (prev, curr, idx) => prev + shapeVolumeMap[idx] * curr, 0
    );
    if (neededSpace <= maxAvailableSpace) {
      count++;
    }
  }

  console.log(count);
}

function solve2(input: ParsedInput): void {
  console.log("todo");
}

main();
