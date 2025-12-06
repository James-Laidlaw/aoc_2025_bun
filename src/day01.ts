import { readInput } from "./utils/readInput";

const input = readInput(1);
const demoInp = `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`;
console.log(input)
console.log("Part 1:", doTimed(solve1));
console.log("Part 1Bad:", doTimed(solveBad));
console.log("Part 2:", doTimed(solve2));
console.log("Part 2Bad:", doTimed(solve2Bad));

function getOrders(): number[] {
  const split = input.split("\n");
  return split.map((inputCommand) => {
    const LRChar = inputCommand.charAt(0);
    const number = parseInt(inputCommand.slice(1));
    return LRChar === "L" ? number * -1 : number;
  });
}

function getDemoOrders(): number[] {
  const split = demoInp.split("\n");
  return split.map((inputCommand) => {
    const LRChar = inputCommand.charAt(0);
    const number = parseInt(inputCommand.slice(1));
    return LRChar === "L" ? number * -1 : number;
  });
}

function doTimed(callback: () => void): void {
  const startTime = performance.now();
  callback();

  const endTime = performance.now();

  console.log(`Execution took ${endTime - startTime} milliseconds`);
}

//remember if dial is 0 to 99 that is a size of 100
function wraparound(input: number, dialSize: number): number {
  let res = input % dialSize;
  if (res < 0) {
    res = dialSize + res; //remember res is negative here
  }
  return res;
}

//remember if dial is 0 to 99 that is a size of 100
function wraparoundWithCount(
  input: number,
  dialSize: number,
  initialPosition: number
): [number, number] {
  let res = input % dialSize;
  if (res < 0) {
    res = dialSize + res; //remember res is negative here
  }

  let wraparoundCount = Math.floor(Math.abs(input / dialSize));
  if (input <= 0 && initialPosition !== 0) {
    wraparoundCount++;
  }
  return [res, wraparoundCount];
}

function solve1(): void {
  const orders = getDemoOrders();
  console.log(demoInp, orders);
  let dialPos = 50;
  let count = 0;
  for (const order of orders) {
    console.log(
      `dialPos: ${dialPos}, order: ${order}, result(pre-wrap): ${
        dialPos + order
      }, result(post-wrap): ${wraparound(dialPos + order, 100)}`
    );
    dialPos = wraparound(dialPos + order, 100);
    if (dialPos === 0) {
      count++;
    }
  }
  console.log(count);
}

function solveBad(): void {
  const orders = getOrders();
  console.log(input, orders);
  let dialPos = 50;
  let count = 0;
  for (const order of orders) {
    console.log(
      `dialPos: ${dialPos}, order: ${order}, result(pre-wrap): ${
        dialPos + order
      }, result(post-wrap): ${wraparound(dialPos + order, 100)}`
    );
    dialPos = wraparound(dialPos + order, 100);
    if (dialPos === 0) {
      count++;
    }
  }
  console.log(count);
}

function solve2(): void {
  const orders = getDemoOrders();
  console.log(demoInp, orders);
  let dialPos = 50;
  let count = 0;
  for (const order of orders) {
    console.log(
      `dialPos: ${dialPos}, order: ${order}, result(pre-wrap): ${
        dialPos + order
      }, result(post-wrap): ${wraparound(dialPos + order, 100)}`
    );
    const [newPos, wraparounds] = wraparoundWithCount(
      dialPos + order,
      100,
      dialPos
    );
    console.log("wraparounds: ", wraparounds);
    dialPos = newPos;
    count += wraparounds;
  }
  console.log(count);
}

function solve2Bad(): void {
  const orders = getOrders();
  console.log(input, orders);
  let dialPos = 50;
  let count = 0;
  for (const order of orders) {
    console.log(
      `dialPos: ${dialPos}, order: ${order}, result(pre-wrap): ${
        dialPos + order
      }, result(post-wrap): ${wraparound(dialPos + order, 100)}`
    );
    const [newPos, wraparounds] = wraparoundWithCount(
      dialPos + order,
      100,
      dialPos
    );
    dialPos = newPos;
    count += wraparounds;
  }
  console.log(count);
}
