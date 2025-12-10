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

  const input = readInput("10", runTypeArg === "full");

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
type machineSpecs = {
  requiredLights: boolean[];
  buttonSpecs: number[][];
  joltageReqs: number[];
};

type ParsedInput = machineSpecs[];

//TODO this is populated with a demo from day 5
function parseInput(inputString: string): ParsedInput {
  const machineStrings = inputString.split("\n");
  const result: ParsedInput = [];
  for (const machineString of machineStrings) {
    const machineStringSplit = machineString.split(" ");
    const requiredLightString = machineStringSplit[0].substring(
      1,
      machineStringSplit[0].length - 1
    );
    const requiredLights = requiredLightString
      .split("")
      .map((lightString) => lightString == "#");

    const buttonStringList = machineStringSplit.slice(1, -1);
    const buttonConfigs = buttonStringList.map((buttonString) => {
      const strippedString = buttonString.substring(1, buttonString.length - 1);
      const splitString = strippedString.split(",");
      const numList = splitString.map((numString) => parseInt(numString));
      return numList;
    });

    const joltageReqString = machineStringSplit[machineStringSplit.length - 1];
    const joltageReqStringStripped = joltageReqString.slice(
      1,
      joltageReqString.length - 1
    );
    const joltageReqs = joltageReqStringStripped
      .split(",")
      .map((numString) => parseInt(numString));
    result.push({
      requiredLights: requiredLights,
      buttonSpecs: buttonConfigs,
      joltageReqs: joltageReqs,
    });
  }
  return result;
}

let stateCache = {} as { [key: string]: number };

function boolListtoString(boolList: boolean[]): string {
  return boolList.map((bool) => (bool ? "#" : ".")).join("");
}

function stringToBoolList(string: string): boolean[] {
  return string.split("").map((char) => char == "#");
}

function solve1(input: ParsedInput): void {
  let sum = 0;

  for (const machineConfig of input) {
    const initialState = machineConfig.requiredLights.map(() => ".").join("");
    const queuedOrVisitedStates: { [state: string]: Boolean } = {};
    const openStatesQueue: { state: string; distance: number }[] = [
      {
        state: initialState,
        distance: 0,
      },
    ];
    queuedOrVisitedStates[initialState] = true;
    const requiredLightString = boolListtoString(machineConfig.requiredLights);
    while (openStatesQueue.length > 0) {
      const stateToExplore = openStatesQueue.shift();
      if (stateToExplore == undefined) throw new Error("bad");
      const stateToExploreBool = stringToBoolList(stateToExplore.state);

      if (stateToExplore.state === requiredLightString) {
        sum += stateToExplore.distance;
        break;
      }

      const reachableStates = machineConfig.buttonSpecs.map((affectedLights) =>
        boolListtoString(
          stateToExploreBool.map((bool, index) =>
            affectedLights.includes(index) ? !bool : bool
          )
        )
      );
      const unQueuedReachableStates = reachableStates.filter(
        (state) => !queuedOrVisitedStates[state]
      );

      unQueuedReachableStates.forEach((state) => {
        openStatesQueue.push({
          state: state,
          distance: stateToExplore.distance + 1,
        });
        queuedOrVisitedStates[state] = true;
      });
    }
  }

  console.log(sum);
}

function stringToNumArray(string: string): number[] {
  const splitString = string.split(",");
  const parsedNumbers = splitString.map((string) => parseInt(string));

  return parsedNumbers;
}

function numArrayToString(numArray: number[]): string {
  return numArray.join(",");
}

function stateIsBeyondSpecs(state: number[], desiredState: number[]): boolean {
  return state.some((joltage, idx) => joltage > desiredState[idx]);
}

function pruneUselessHarmfulOptions(
  state: number[],
  desiredState: number[],
  options: number[][]
): number[][] {
  const joltsThatNeedToIncrease: { [joltIdx: number]: boolean } = {};
  state.forEach((currentJolt, idx) => {
    if (desiredState[idx] > currentJolt) {
      joltsThatNeedToIncrease[idx] = true;
    }
  });

  const viableButtonsToPush = options.filter((buttonAffectedJolts) =>
    buttonAffectedJolts.every((joltIdx) => joltsThatNeedToIncrease[joltIdx])
  );

  // if there are some buttons that are the sole way to increase joltage for that element, prioritize pressing those first (internally prioritize early joltage over late joltage to reduce branching)
  const optionsToIncreaseEachJoltage: number[][][] = []; //0 contains all options that (in part) increase joltage 0, 1 does the same for 1, etc
  for (let joltIdx = 0; joltIdx < state.length; joltIdx++) {
    if (!joltsThatNeedToIncrease[joltIdx]) continue;

    const allOptionsThatCanIncreaseJoltIdx = viableButtonsToPush.filter(
      (buttonAffectedJolts) => buttonAffectedJolts.includes(joltIdx)
    );
    if (allOptionsThatCanIncreaseJoltIdx.length == 1) {
      return allOptionsThatCanIncreaseJoltIdx;
    }
  }

  return viableButtonsToPush;
}

function pruneUselessHarmfulOptionsExperimental(
  state: number[],
  desiredState: number[],
  options: number[][]
): number[][] {
  const joltsThatNeedToIncrease: { [joltIdx: number]: boolean } = {};
  state.forEach((currentJolt, idx) => {
    if (desiredState[idx] > currentJolt) {
      joltsThatNeedToIncrease[idx] = true;
    }
  });

  const viableButtonsToPush = options.filter((buttonAffectedJolts) =>
    buttonAffectedJolts.every((joltIdx) => joltsThatNeedToIncrease[joltIdx])
  );

  // if you need to increase 1, 2, 3 and 4 and you have the options (1, 2, 3, 4) and (1, 2, 3) and (4) and there are no other options that influence 1, 2, 3, or 4 then you shold use 1, 2, 3, 4

  //pick joltage with least options to increase it, only allow options from that joltage first
  let bestOptions: number[][] | undefined;
  for (let joltIdx = 0; joltIdx < state.length; joltIdx++) {
    if (!joltsThatNeedToIncrease[joltIdx]) continue;

    const optionsForJoltage = viableButtonsToPush.filter(
      (buttonAffectedJolts) => buttonAffectedJolts.includes(joltIdx)
    );

    if (
      bestOptions == undefined ||
      bestOptions.length > optionsForJoltage.length
    ) {
      bestOptions = optionsForJoltage;

      if (bestOptions.length == 1) {
        return bestOptions;
      }
    }
  }

  return viableButtonsToPush;
}

function areArraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length != arr2.length) return false;
  return arr1.every((entry, idx) => entry === arr2[idx]);
}

type state = { state: string; distance: number; bannedButtons?: number[][] };
function solve2(input: ParsedInput): void {
  let sum = 0;
  let machineCount = 0;
  for (const machineConfig of input) {
    console.log("starting machine: ", machineCount++);
    const initialState = numArrayToString(
      machineConfig.joltageReqs.map(() => 0)
    );
    const queuedOrVisitedStates: { [state: string]: Boolean } = {};

    const openStatesQueue: state[] = [
      {
        state: initialState,
        distance: 0,
      },
    ];
    queuedOrVisitedStates[initialState] = true;
    const requiredJoltageString = numArrayToString(machineConfig.joltageReqs);
    while (openStatesQueue.length > 0) {
      // console.log("open options: ", openStatesQueue.length);
      const stateToExplore = openStatesQueue.shift();
      if (stateToExplore == undefined) throw new Error("bad");
      if (stateToExplore.state === requiredJoltageString) {
        sum += stateToExplore.distance;
        break;
      }
      // console.log("exploring: ", stateToExplore.state);

      const stateToExploreNumeric = stringToNumArray(stateToExplore.state);

      const optionsAfterRemovingBanned = machineConfig.buttonSpecs.filter(
        (button) =>
          !(stateToExplore.bannedButtons ?? []).every(
            (bannedButton) => !areArraysEqual(button, bannedButton)
          )
      );

      const optionsToUse = pruneUselessHarmfulOptionsExperimental(
        stateToExploreNumeric,
        machineConfig.joltageReqs,
        optionsAfterRemovingBanned
      );

      const optionSubsetMap = {}

      const reachableStatesNumeric = optionsToUse.map(
        (affectedJolts) =>
          ({
            state: numArrayToString(
              stateToExploreNumeric.map((number, index) =>
                affectedJolts.includes(index) ? number + 1 : number
              )
            ),
            distance: stateToExplore.distance + 1,
          } as state)
      );

      const statesToQueue = reachableStatesNumeric.filter(
        (state) => !queuedOrVisitedStates[state.state]
      );

      statesToQueue.forEach((state) => {
        openStatesQueue.push(state);
        queuedOrVisitedStates[state.state] = true;
      });
    }
  }

  console.log(sum);
}

main();
