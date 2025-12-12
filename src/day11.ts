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

  const input = readInput("11", runTypeArg === "full");

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

type node = {
  name: string;
  downlinkedNames: string[];
};

type ParsedInput = node[];

function parseInput(inputString: string): ParsedInput {
  const nodeStrings = inputString.split("\n");

  const nodesOutList: node[] = [];

  for (const nodeString of nodeStrings) {
    const colonSplit = nodeString.split(":");
    const name = colonSplit[0];
    const connectionNames = colonSplit[1].trim().split(" ");

    nodesOutList.push({
      name: name,
      downlinkedNames: connectionNames,
    });
  }

  return nodesOutList;
}

type networkedNode = node & {
  uplinkNames: string[];
};

type countedNetworkNode = networkedNode & {
  reachableCount: number;
  visitedCount: number;
  dissolved: boolean;
};
function solve1(input: ParsedInput): void {
  const nodeDirectory: { [name: string]: countedNetworkNode } = {};
  nodeDirectory["out"] = {
    name: "out",
    downlinkedNames: [],
    uplinkNames: [],
    reachableCount: 0,
    visitedCount: 0,
    dissolved: false,
  };

  for (const node of input) {
    nodeDirectory[node.name] = {
      ...node,
      uplinkNames: [],
      reachableCount: 0,
      visitedCount: 0,
      dissolved: false,
    };
  }

  for (const node of input) {
    for (const downLink of node.downlinkedNames) {
      nodeDirectory[downLink].uplinkNames.push(node.name);
    }
  }

  nodeDirectory["you"].reachableCount = 1;
  nodeDirectory["you"].visitedCount = 1;
  nodeDirectory["you"].uplinkNames.push("Ouside starting pos");

  // if a node has "you" as an output - it must not be reachable because otherwise we'd get an infinite cycle
  const choppingBlock: string[] = Object.values(nodeDirectory)
    .filter((node) => node.downlinkedNames.includes("you"))
    .map((node) => node.name);
  while (choppingBlock.length > 0) {
    const itemToKillName = choppingBlock.pop();
    if (itemToKillName == undefined) {
      throw Error("oops");
    }
    console.log("cutting out ", itemToKillName);

    const itemToKill = nodeDirectory[itemToKillName];
    if (itemToKill === undefined) continue;

    // remove name from child node's uplinks. if this brings child to 0 uplinks it goes on the block too (unless it's 'you')
    itemToKill.downlinkedNames.forEach((downlinkName) => {
      const child = nodeDirectory[downlinkName];
      child.uplinkNames = child.uplinkNames.filter(
        (name) => name != itemToKillName
      );
      if (child.uplinkNames.length == 0) {
        choppingBlock.push(child.name);
      }
    });

    //remove name from parent node's downlinks
    itemToKill.uplinkNames.forEach((uplinkName) => {
      const parent = nodeDirectory[uplinkName];
      parent.downlinkedNames = parent.downlinkedNames.filter(
        (name) => name != itemToKillName
      );
    });

    //because we know that chopping block nodes are unreachable, all their parents must also be
    choppingBlock.push(...itemToKill.uplinkNames);

    //remove self from directory
    delete nodeDirectory[itemToKillName];
  }

  let remainingNodes = Object.values(nodeDirectory).length;
  while (remainingNodes > 1) {
    const nodesReadyToDissolve = Object.values(nodeDirectory).filter(
      (node) => !node.dissolved && node.visitedCount == node.uplinkNames.length
    );
    console.log("dissolving", nodesReadyToDissolve.length, "nodes");
    for (const node of nodesReadyToDissolve) {
      for (const childNodeName of node.downlinkedNames) {
        const childNode = nodeDirectory[childNodeName];

        if (childNode.dissolved) throw new Error("its cooked");

        childNode.reachableCount += node.reachableCount;
        childNode.visitedCount++;
      }
      node.dissolved = true;
      remainingNodes--;
    }
  }

  const outNode = nodeDirectory["out"];

  console.log(outNode.reachableCount, outNode);
}

type typeCountedNetworkNode = countedNetworkNode & {
  dacReachable: number;
  fftReachable: number;
  bothReachable: number;
  visitedCount: number;
  dissolved: boolean;
};

function solve2(input: ParsedInput): void {
  const nodeDirectory: { [name: string]: typeCountedNetworkNode } = {};
  nodeDirectory["out"] = {
    name: "out",
    downlinkedNames: [],
    uplinkNames: [],
    reachableCount: 0,
    dacReachable: 0,
    fftReachable: 0,
    bothReachable: 0,
    visitedCount: 0,
    dissolved: false,
  };

  for (const node of input) {
    nodeDirectory[node.name] = {
      ...node,
      uplinkNames: [],
      reachableCount: 0,
      dacReachable: 0,
      fftReachable: 0,
      bothReachable: 0,
      visitedCount: 0,
      dissolved: false,
    };
  }

  for (const node of input) {
    for (const downLink of node.downlinkedNames) {
      nodeDirectory[downLink].uplinkNames.push(node.name);
    }
  }

  nodeDirectory["svr"].reachableCount = 1;
  nodeDirectory["svr"].visitedCount = 1;
  nodeDirectory["svr"].uplinkNames.push("Ouside starting pos");

  // if a node has "svr" as an output - it must not be reachable because otherwise we'd get an infinite cycle
  const choppingBlock: string[] = Object.values(nodeDirectory)
    .filter((node) => node.downlinkedNames.includes("svr"))
    .map((node) => node.name);
  while (choppingBlock.length > 0) {
    const itemToKillName = choppingBlock.pop();
    if (itemToKillName == undefined) {
      throw Error("oops");
    }
    // console.log("cutting out ", itemToKillName);

    const itemToKill = nodeDirectory[itemToKillName];
    if (itemToKill === undefined) continue;

    // remove name from child node's uplinks. if this brings child to 0 uplinks it goes on the block too (unless it's 'svr')
    itemToKill.downlinkedNames.forEach((downlinkName) => {
      const child = nodeDirectory[downlinkName];
      child.uplinkNames = child.uplinkNames.filter(
        (name) => name != itemToKillName
      );
      if (child.uplinkNames.length == 0) {
        choppingBlock.push(child.name);
      }
    });

    //remove name from parent node's downlinks
    itemToKill.uplinkNames.forEach((uplinkName) => {
      const parent = nodeDirectory[uplinkName];
      parent.downlinkedNames = parent.downlinkedNames.filter(
        (name) => name != itemToKillName
      );
    });

    //because we know that chopping block nodes are unreachable, all their parents must also be
    choppingBlock.push(...itemToKill.uplinkNames);

    //remove self from directory
    delete nodeDirectory[itemToKillName];
  }

  let remainingNodes = Object.values(nodeDirectory).length;
  while (remainingNodes > 1) {
    const nodesReadyToDissolve = Object.values(nodeDirectory).filter(
      (node) => !node.dissolved && node.visitedCount == node.uplinkNames.length
    );
    // console.log("dissolving", nodesReadyToDissolve.length, "nodes");
    for (const node of nodesReadyToDissolve) {
      for (const childNodeName of node.downlinkedNames) {
        const childNode = nodeDirectory[childNodeName];

        // if (childNode.dissolved) throw new Error("its cooked");

        if ((childNode.name == "dac")) {
          childNode.dacReachable += node.reachableCount + node.dacReachable;
          childNode.bothReachable += node.fftReachable + node.bothReachable;
        } else if ((childNode.name == "fft")) {
          childNode.fftReachable += node.reachableCount + node.fftReachable;
          childNode.bothReachable += node.dacReachable + node.bothReachable;
        }

        childNode.reachableCount += node.reachableCount;
        childNode.dacReachable += node.dacReachable;
        childNode.fftReachable += node.fftReachable;
        childNode.bothReachable += node.bothReachable;
        childNode.visitedCount++;
      }
      node.dissolved = true;
      remainingNodes--;
    }
  }

  const outNode = nodeDirectory["out"];

  console.log(outNode.reachableCount, outNode);
}

main();
