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

function getIndexesOFJoltsThatNeedToIncrease(
  state: number[],
  desiredState: number[]
) {
  const IndexesOFJoltsThatNeedToIncrease: number[] = [];
  state.forEach((currentJolt, idx) => {
    if (desiredState[idx] > currentJolt) {
      IndexesOFJoltsThatNeedToIncrease.push(idx);
    }
  });
  return IndexesOFJoltsThatNeedToIncrease;
}

// prune options that we literally can't use or we will overshoot
function getNonHarmfulButtonIdxs(
  IndexesOfJoltsThatNeedToIncrease: number[], // must be sorted
  buttonsInfo: number[][] // each button must be sorted
): number[] {
  const harmlessButtonIdxs = [] as number[];
  buttonsInfo.forEach((buttonInfo, idx) => {
    if (isArraySuperset(buttonInfo, IndexesOfJoltsThatNeedToIncrease)) {
      harmlessButtonIdxs.push(idx);
    }
  });
  return harmlessButtonIdxs;
}

function isStateImpossible(
  IndexesOfJoltsThatNeedToIncrease: number[],
  usableButtonIdxs: number[],
  buttonInfoMap: number[][]
): boolean {
  let remainingJolts = IndexesOfJoltsThatNeedToIncrease;

  for (const usableButtonIdx of usableButtonIdxs) {
    remainingJolts = remainingJolts.filter(
      (joltIdx) => !buttonInfoMap[usableButtonIdx].includes(joltIdx)
    );

    if (remainingJolts.length == 0) {
      return false;
    }
  }

  return remainingJolts.length > 0;
}

function selectMostUsefulOptions(
  indexesOfJoltsThatNeedToIncrease: number[],
  availableButtonIdxs: number[],
  buttonValueMap: number[][]
): number[] {
  //pick joltage with least options to increase it, only allow options from that joltage first
  let bestOptions: number[] | undefined;
  for (const joltIndex of indexesOfJoltsThatNeedToIncrease) {
    const optionsForJoltage = availableButtonIdxs.filter((buttonIdx) =>
      buttonValueMap[buttonIdx].includes(joltIndex)
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

  return bestOptions ?? availableButtonIdxs;
}

function areArraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length != arr2.length) return false;
  return arr1.every((entry, idx) => entry === arr2[idx]);
}

function isButtonInButtonArray<T extends any>(
  button: T[],
  arrayToCheck: T[][]
): boolean {
  return arrayToCheck.some((arrayToCheckElement) =>
    areArraysEqual(arrayToCheckElement, button)
  );
}

function filterBannedButtons(
  buttonindexes: number[],
  bannedButtonIndexes: number[]
): number[] {
  const unbannedButtons: number[] = [];
  let buttonIdx = 0;
  let banIdx = 0;

  while (
    buttonIdx < buttonindexes.length &&
    banIdx < bannedButtonIndexes.length
  ) {
    const button = buttonindexes[buttonIdx];
    const banEntry = bannedButtonIndexes[banIdx];

    if (button === banEntry) {
      buttonIdx++;
      banIdx++;
    } else if (button < banEntry) {
      unbannedButtons.push(button);
      buttonIdx++;
    } else {
      banIdx++;
    }
  }

  while (buttonIdx < buttonindexes.length) {
    unbannedButtons.push(buttonindexes[buttonIdx++]);
  }

  return unbannedButtons;
}

function mergeSorted(list1: number[], list2: number[]): number[] {
  let idx1 = 0;
  let idx2 = 0;
  const res = [];
  while (idx1 < list1.length && idx2 < list2.length) {
    if (list1[idx1] < list2[idx2]) {
      res.push(list1[idx1]);
      idx1++;
    } else if (list1[idx1] == list2[idx2]) {
      //avoid duplicates by only adding the iteration from 1
      res.push(list1[idx1]);
      idx1++;
      idx2++;
    } else {
      res.push(list2[idx2]);
      idx2++;
    }
  }

  while (idx1 < list1.length) {
    res.push(list1[idx1++]);
  }

  while (idx2 < list2.length) {
    res.push(list2[idx2++]);
  }
  return res;
}

function isArraySuperset(
  subsetArray: number[],
  supersetArray: number[]
): boolean {
  if (supersetArray.length < subsetArray.length) return false;
  let subIdx = 0;
  let superIdx = 0;

  while (subIdx < subsetArray.length && superIdx < supersetArray.length) {
    if (subsetArray[subIdx] == supersetArray[superIdx]) {
      subIdx++;
    }
    superIdx++;
  }

  return superIdx != supersetArray.length || subIdx == subsetArray.length;
}

type trieNode = {
  children: (trieNode | undefined)[];
};
class ArrayHashmap {
  private internalTrie: trieNode;

  constructor(arrayLength: number) {
    this.internalTrie = { children: [] };
  }

  public add(array: number[]) {
    let currentNode = this.internalTrie;

    for (const item of array) {
      if (currentNode.children[item] == undefined) {
        currentNode.children[item] = { children: [] };
      }
      currentNode = currentNode.children[item];
    }
  }

  public exists(array: number[]) {
    let currentNode = this.internalTrie;

    for (const item of array) {
      if (currentNode.children[item] == undefined) {
        return false;
      }
      currentNode = currentNode.children[item];
    }
    return true;
  }
}

type state = {
  joltageState: number[];
  distance: number;
  bannedButtons?: number[];
};
function solve2(input: ParsedInput): void {
  let sum = 0;
  let machineCount = 0;
  for (const machineConfig of input) {
    console.log("starting machine: ", machineCount++);
    const buttonInfoMap = machineConfig.buttonSpecs.toSorted(
      (a, b) => b.length - a.length
    );
    const initialJoltageState = machineConfig.joltageReqs.map(() => 0);
    const queuedOrVisitedJoltageStates = new ArrayHashmap(
      machineConfig.joltageReqs.length
    );

    const dualPhaseQueue: [state[], state[]] = [
      [
        {
          joltageState: initialJoltageState,
          distance: 0,
        },
      ],
      [],
    ];
    let readPhase = 0;
    let writePhase = 1;

    // queuedOrVisitedStates[initialState] = true;
    const requiredJoltage = machineConfig.joltageReqs;
    let currentDepthLogging = 0;
    while (true) {
      // console.log("open options: ", openStatesQueue.length);

      if (dualPhaseQueue[readPhase].length == 0) {
        const temp = readPhase;
        readPhase = writePhase;
        writePhase = temp;
        if (dualPhaseQueue[readPhase].length == 0) {
          throw new Error("explored all states without finding an answer");
        }
      }
      const stateToExplore = dualPhaseQueue[readPhase].pop();
      if (stateToExplore == undefined) throw new Error("shouldn't happen");
      if (areArraysEqual(stateToExplore.joltageState, requiredJoltage)) {
        sum += stateToExplore.distance;
        break;
      }
      // console.log("exploring: ", stateToExplore.state);
      if (stateToExplore.distance > currentDepthLogging) {
        currentDepthLogging = stateToExplore.distance;
        console.log("reached depth: ", stateToExplore.distance);
      }

      if (stateToExplore.distance < currentDepthLogging) {
        console.log("breadth-first rule broken");
      }

      const stateToExploreNumeric = stateToExplore.joltageState;

      const indexesOfJoltsThatNeedToIncrease =
        getIndexesOFJoltsThatNeedToIncrease(
          stateToExploreNumeric,
          machineConfig.joltageReqs
        );
      let buttonsToUse = getNonHarmfulButtonIdxs(
        indexesOfJoltsThatNeedToIncrease,
        buttonInfoMap
      );

      //remove any banned buttons
      if (
        stateToExplore.bannedButtons != undefined &&
        stateToExplore.bannedButtons.length > 0
      ) {
        buttonsToUse = filterBannedButtons(
          buttonsToUse,
          stateToExplore.bannedButtons
        );
      }

      //if in impossible state, give up on branch
      const impossible = isStateImpossible(
        indexesOfJoltsThatNeedToIncrease,
        buttonsToUse,
        buttonInfoMap
      );

      if (impossible) {
        // console.log("pruned impossible option!");
        continue;
      }

      buttonsToUse = selectMostUsefulOptions(
        indexesOfJoltsThatNeedToIncrease,
        buttonsToUse,
        buttonInfoMap
      );

      const reachableStatesNumeric = buttonsToUse.map(
        (
          buttonIdx,
          buttonIdxIdx //yes i know buttonidxidx is confusing
        ) => {
          let idxFirstSameSizeButton = buttonIdxIdx;
          while (
            idxFirstSameSizeButton > 0 &&
            buttonInfoMap[buttonsToUse[idxFirstSameSizeButton - 1]].length ==
              buttonInfoMap[buttonsToUse[idxFirstSameSizeButton]].length
          ) {
            idxFirstSameSizeButton--;
          }

          let bannedButtons: undefined | number[];
          const prevBannedButtons = stateToExplore.bannedButtons;
          const biggerButtonsNotChosen = buttonsToUse.slice(
            0,
            idxFirstSameSizeButton
          );

          // if stateToExplore had banned buttons (and they weren't an empty list)
          if (prevBannedButtons != undefined && prevBannedButtons.length > 0) {
            if (biggerButtonsNotChosen.length > 0) {
              bannedButtons = mergeSorted(
                prevBannedButtons,
                biggerButtonsNotChosen
              );
            } else {
              bannedButtons = prevBannedButtons;
            }
          } else if (biggerButtonsNotChosen.length > 0) {
            bannedButtons = biggerButtonsNotChosen;
          }

          return {
            joltageState: stateToExploreNumeric.map((number, index) =>
              buttonInfoMap[buttonIdx].includes(index) ? number + 1 : number
            ),
            distance: stateToExplore.distance + 1,
            bannedButtons: bannedButtons,
          };
        }
      );

      const statesToQueue = reachableStatesNumeric.filter((state) => {
        return (
          !queuedOrVisitedJoltageStates.exists(state.joltageState)
        );
      });

      statesToQueue.forEach((state) => {
        dualPhaseQueue[writePhase].push(state);
        queuedOrVisitedJoltageStates.add(state.joltageState);
      });
    }
  }

  console.log(sum);
}

main();
