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

  const input = readInput("08", runTypeArg === "full");

  const parsedInput: ParsedInput = parseInput(input);

  if (runPartArg == "1") {
    console.log("starting part 1");
    doTimed(() => solve1(parsedInput, runTypeArg == "full" ? 1000 : 10));
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

type ParsedInput = point3d[];

function parseInput(inputString: string): ParsedInput {
  const pointCoordStrings = inputString.split("\n");

  return pointCoordStrings.map((pointCoordString) => {
    const split = pointCoordString
      .split(",")
      .map((coordString) => parseInt(coordString));
    return { x: split[0], y: split[1], z: split[2] };
  });
}

type point3d = {
  x: number;
  y: number;
  z: number;
};

function StraightLineDistance(p1: point3d, p2: point3d): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2)
  );
}

function solve1(input: ParsedInput, connectionCount: number): void {
  const circuitList: Set<number>[] = [];

  // build ranked list of best pairs
  const rankedPointPairs: {
    point1: number;
    point2: number;
    distance: number;
  }[] = [];

  for (let p1Idx = 0; p1Idx < input.length; p1Idx++) {
    for (let p2Idx = p1Idx + 1; p2Idx < input.length; p2Idx++) {
      const pairDist = StraightLineDistance(input[p1Idx], input[p2Idx]);
      rankedPointPairs.push({
        point1: p1Idx,
        point2: p2Idx,
        distance: pairDist,
      });
    }
  }

  rankedPointPairs.sort((a, b) => a.distance - b.distance);

  for (let i = 0; i < connectionCount; i++) {
    const pairToMatch = rankedPointPairs[i];

    const p1CircuitIdx = circuitList.findIndex((circuit) =>
      circuit.has(pairToMatch.point1)
    );
    const p2CircuitIdx = circuitList.findIndex((circuit) =>
      circuit.has(pairToMatch.point2)
    );
    if (p1CircuitIdx == -1 && p2CircuitIdx == -1) {
      const newCircuit = new Set([pairToMatch.point1, pairToMatch.point2]);
      circuitList.push(newCircuit);
    } else if (p1CircuitIdx === p2CircuitIdx) {
      continue;
    } else if (p1CircuitIdx == -1) {
      circuitList[p2CircuitIdx].add(pairToMatch.point1);
    } else if (p2CircuitIdx == -1) {
      circuitList[p1CircuitIdx].add(pairToMatch.point2);
    } else {
      const earlierIdx = Math.min(p1CircuitIdx, p2CircuitIdx);
      const laterIdx = Math.max(p1CircuitIdx, p2CircuitIdx);

      const [laterCircuit] = circuitList.splice(laterIdx, 1);
      circuitList[earlierIdx] = laterCircuit.union(circuitList[earlierIdx]);
    }
  }
  circuitList.sort((c1, c2) => c2.size - c1.size);
  // errorSweep(circuitList);
  const result =
    circuitList[0].size * circuitList[1].size * circuitList[2].size;
  console.log(result);
}

function errorSweep(circuitList: Set<number>[]) {
  for (let p1Idx = 0; p1Idx < circuitList.length; p1Idx++) {
    for (let p2Idx = p1Idx + 1; p2Idx < circuitList.length; p2Idx++) {
      if (!circuitList[p1Idx].isDisjointFrom(circuitList[p2Idx])) {
        throw new Error("DUPLICATES FOUND");
      }
    }
  }
}

function solve2(input: ParsedInput): void {
  const circuitList: Set<number>[] = [];

  // build ranked list of best pairs
  const rankedPointPairs: {
    point1: number;
    point2: number;
    distance: number;
  }[] = []; //pair of indexes into input list

  for (let p1Idx = 0; p1Idx < input.length; p1Idx++) {
    for (let p2Idx = p1Idx + 1; p2Idx < input.length; p2Idx++) {
      const pairDist = StraightLineDistance(input[p1Idx], input[p2Idx]);
      rankedPointPairs.push({
        point1: p1Idx,
        point2: p2Idx,
        distance: pairDist,
      });
    }
  }

  rankedPointPairs.sort((a, b) => a.distance - b.distance);
  let currentPairToMatchIdx = 0;
  let remainingCircuits = input.length;
  while (remainingCircuits > 1) {
    const pairToMatch = rankedPointPairs[currentPairToMatchIdx];
    currentPairToMatchIdx++;

    const p1CircuitIdx = circuitList.findIndex((circuit) =>
      circuit.has(pairToMatch.point1)
    );
    const p2CircuitIdx = circuitList.findIndex((circuit) =>
      circuit.has(pairToMatch.point2)
    );
    if (p1CircuitIdx == -1 && p2CircuitIdx == -1) {
      const newCircuit = new Set([pairToMatch.point1, pairToMatch.point2]);
      circuitList.push(newCircuit);
      remainingCircuits--;
    } else if (p1CircuitIdx === p2CircuitIdx) {
      continue;
    } else if (p1CircuitIdx == -1) {
      circuitList[p2CircuitIdx].add(pairToMatch.point1);
      remainingCircuits--;
    } else if (p2CircuitIdx == -1) {
      circuitList[p1CircuitIdx].add(pairToMatch.point2);
      remainingCircuits--;
    } else {
      const earlierIdx = Math.min(p1CircuitIdx, p2CircuitIdx);
      const laterIdx = Math.max(p1CircuitIdx, p2CircuitIdx);

      const [laterCircuit] = circuitList.splice(laterIdx, 1);
      circuitList[earlierIdx] = laterCircuit.union(circuitList[earlierIdx]);
      remainingCircuits--;
    }
  }

  console.log("last pair matched was: ", rankedPointPairs[currentPairToMatchIdx - 1]);
  console.log("the X values multiplied = ", input[rankedPointPairs[currentPairToMatchIdx - 1].point1].x * input[rankedPointPairs[currentPairToMatchIdx - 1].point2].x);
}

main();
