// it's fun to write bad code sometimes
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

  const input = readInput("09", runTypeArg === "full");

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
type ParsedInput = point2d[];

function parseInput(inputString: string): ParsedInput {
  const pointCoordStrings = inputString.split("\n");

  return pointCoordStrings.map((pointCoordString) => {
    const split = pointCoordString
      .split(",")
      .map((coordString) => parseInt(coordString));
    return { x: split[0], y: split[1] } as point2d;
  });
}

type point2d = {
  x: number;
  y: number;
};

function Area(p1: point2d, p2: point2d): number {
  return (Math.abs(p1.x - p2.x) + 1) * (Math.abs(p1.y - p2.y) + 1);
}

enum directions {
  HOR,
  VERT,
}
type line = {
  lesserEnd: number;
  greaterEnd: number;
  perpendicularIndex: number;
};
class Grid {
  private _horizontalLines: line[] = [];
  private _verticalLines: line[] = [];

  constructor() {
    this._horizontalLines = [];
    this._verticalLines = [];
  }

  public AddLine(line: line, orientation: directions) {
    if (orientation == directions.HOR) this.AddHorizontalLine(line);
    else this.AddVerticalLine(line);
  }

  public AddHorizontalLine(line: line) {
    this._horizontalLines.push(line);
  }

  public AddVerticalLine(line: line) {
    this._verticalLines.push(line);
  }

  public doneAddingLines() {
    this._verticalLines.sort(
      (a, b) => a.perpendicularIndex - b.perpendicularIndex
    );
    this._horizontalLines.sort(
      (a, b) => a.perpendicularIndex - b.perpendicularIndex
    );
  }


  public doesThisLineIntersectWithAnyPerpendicularLines(
    lineToCheck: line,
    checkLineOrientation: directions,
    countGrazingGreaterEnds: boolean,
    countGrazingLesserEnds: boolean
  ) {
    const sourceList =
      checkLineOrientation == directions.HOR
        ? this._verticalLines
        : this._horizontalLines; // check a vertical line against horizontal lines & vice versa

    const lineCandidates = sourceList.filter(
      (line) =>
        line.perpendicularIndex < lineToCheck.greaterEnd &&
        line.perpendicularIndex > lineToCheck.lesserEnd
    ); //lines whose perpendicular index is between the start and end of the line
    const foundAnIntersection = lineCandidates.some(
      (line) =>
        (lineToCheck.perpendicularIndex < line.greaterEnd &&
          lineToCheck.perpendicularIndex > line.lesserEnd) ||
        (countGrazingGreaterEnds &&
          lineToCheck.perpendicularIndex == line.greaterEnd) ||
        (countGrazingLesserEnds &&
          lineToCheck.perpendicularIndex == line.lesserEnd)
    );

    return foundAnIntersection;
  }


  public extendLineGreaterEndAsFarAsPossibleInsidePolygon(
    line: line,
    direction: directions,
    lineSide: "lesser" | "greater" //lesser lines (left or top) can be extended until they encounter the body or lesser end of another line
    //greater lines (right or bottom) can be extended until they encounter the body or greater end of another line
  ): line {
    const perpendicularLines =
      direction == directions.HOR ? this._verticalLines : this._horizontalLines;
    let IdxOflineRightAfterGreaterEnd =
      perpendicularLines.findIndex(
        (perpLine) => perpLine.perpendicularIndex > line.lesserEnd
      ) - 1;

    while (
      IdxOflineRightAfterGreaterEnd >= 0 &&
      IdxOflineRightAfterGreaterEnd < perpendicularLines.length
    ) {
      const lineToCheck = perpendicularLines[IdxOflineRightAfterGreaterEnd];
      if (
        line.perpendicularIndex < lineToCheck.greaterEnd &&
        line.perpendicularIndex > lineToCheck.lesserEnd
      ) {
        break;
      }

      if (
        line.perpendicularIndex == lineToCheck.greaterEnd &&
        lineSide == "greater"
      ) {
        break;
      }

      if (
        line.perpendicularIndex == lineToCheck.lesserEnd &&
        lineSide == "lesser"
      ) {
        break;
      }
      IdxOflineRightAfterGreaterEnd++;
    }

    const extendedGreaterEnd =
      IdxOflineRightAfterGreaterEnd >= 0 &&
      IdxOflineRightAfterGreaterEnd < perpendicularLines.length
        ? perpendicularLines[IdxOflineRightAfterGreaterEnd].perpendicularIndex
        : Infinity;

    return {
      perpendicularIndex: line.perpendicularIndex,
      lesserEnd: line.lesserEnd,
      greaterEnd: extendedGreaterEnd,
    } as line;
  }

  public extendLineLesserEndAsFarAsPossibleInsidePolygon(
    line: line,
    direction: directions,
    lineSide: "lesser" | "greater" //lesser lines (left or top) can be extended until they encounter the body or lesser end of another line
    //greater lines (right or bottom) can be extended until they encounter the body or greater end of another line
  ): line {
    const perpendicularLines =
      direction == directions.HOR ? this._verticalLines : this._horizontalLines;
    let IdxOflineRightBeforelesserEnd =
      perpendicularLines.findIndex(
        (perpLine) => perpLine.perpendicularIndex < line.lesserEnd
      ) - 1;

    while (IdxOflineRightBeforelesserEnd > -1) {
      const lineToCheck = perpendicularLines[IdxOflineRightBeforelesserEnd];
      if (
        line.perpendicularIndex < lineToCheck.greaterEnd &&
        line.perpendicularIndex > lineToCheck.lesserEnd
      ) {
        break;
      }

      if (
        line.perpendicularIndex == lineToCheck.greaterEnd &&
        lineSide == "greater"
      ) {
        break;
      }

      if (
        line.perpendicularIndex == lineToCheck.lesserEnd &&
        lineSide == "lesser"
      ) {
        break;
      }
      IdxOflineRightBeforelesserEnd--;
    }

    const extendedlesserEnd =
      IdxOflineRightBeforelesserEnd < 0
        ? -Infinity
        : perpendicularLines[IdxOflineRightBeforelesserEnd].perpendicularIndex;

    return {
      perpendicularIndex: line.perpendicularIndex,
      lesserEnd: extendedlesserEnd,
      greaterEnd: line.greaterEnd,
    } as line;
  }

  get verticalLines() {
    return JSON.parse(JSON.stringify(this._verticalLines)) as line[];
  }

  get horizontalLines() {
    return JSON.parse(JSON.stringify(this._horizontalLines)) as line[];
  }
}

function solve1(input: ParsedInput): void {
  let bestPair = [0, 0];
  let bestScore = Area(input[0], input[0]);

  for (let i = 0; i < input.length; i++) {
    for (let j = i + 1; j < input.length; j++) {
      const score = Area(input[i], input[j]);
      if (score > bestScore) {
        bestPair = [i, j];
        bestScore = score;
      }
    }
  }
  console.log("bestScore", bestScore);
  console.log("bestPair", input[bestPair[0]], input[bestPair[1]]);
}

function solve2(input: ParsedInput): void {
  const grid = new Grid();

  //paint the grid
  for (let i = 0; i < input.length; i++) {
    const point = input[i];

    const pointToConnect = i == 0 ? input[input.length - 1] : input[i - 1];

    const lineDirection =
      point.x == pointToConnect.x ? directions.VERT : directions.HOR;
    const coincidentKey: keyof point2d =
      lineDirection == directions.HOR ? "x" : "y";
    const perpendicularKey: keyof point2d =
      lineDirection == directions.HOR ? "y" : "x";

    const line: line = {
      lesserEnd: Math.min(point[coincidentKey], pointToConnect[coincidentKey]),
      greaterEnd: Math.max(point[coincidentKey], pointToConnect[coincidentKey]),
      perpendicularIndex: point[perpendicularKey],
    };

    grid.AddLine(line, lineDirection);
  }
  grid.doneAddingLines();


  //find the best rectangle
  let bestScore = 1;
  for (const LC1 of input) {
    for (const RC1 of input) {
      if (LC1 == RC1 || LC1.x > RC1.x) continue;
      const LC2: point2d = {
        x: LC1.x,
        y: RC1.y,
      };
      const RC2: point2d = {
        x: RC1.x,
        y: LC1.y,
      };

      const bottomLeftCorner = LC1.y > LC2.y ? LC1 : LC2;
      const bottomRightCorner = RC1.y > RC2.y ? RC1 : RC2;
      const topLeftCorner = LC1.y > LC2.y ? LC2 : LC1;
      const topRightCorner = RC1.y > RC2.y ? RC2 : RC1;

      const bottomLine: line = {
        perpendicularIndex: bottomLeftCorner.y,
        lesserEnd: bottomLeftCorner.x,
        greaterEnd: bottomLeftCorner.x,
      };
      if (
        grid.doesThisLineIntersectWithAnyPerpendicularLines(
          bottomLine,
          directions.HOR,
          true,
          false
        )
      )
        continue;

      const topLine: line = {
        perpendicularIndex: topLeftCorner.y,
        lesserEnd: topLeftCorner.x,
        greaterEnd: topRightCorner.x,
      };
      if (
        grid.doesThisLineIntersectWithAnyPerpendicularLines(
          topLine,
          directions.HOR,
          false,
          true
        )
      )
        continue;

      const leftLine: line = {
        perpendicularIndex: topLeftCorner.x,
        lesserEnd: topLeftCorner.y,
        greaterEnd: bottomLeftCorner.y,
      };

      if (
        grid.doesThisLineIntersectWithAnyPerpendicularLines(
          leftLine,
          directions.VERT,
          false,
          true
        )
      )
        continue;

      const rightLine: line = {
        perpendicularIndex: topRightCorner.x,
        lesserEnd: topRightCorner.y,
        greaterEnd: bottomRightCorner.y,
      };
      if (
        grid.doesThisLineIntersectWithAnyPerpendicularLines(
          rightLine,
          directions.VERT,
          true,
          false
        )
      )
        continue;

      const score = Area(bottomLeftCorner, topRightCorner);
      if (score > bestScore) {
        bestScore = score;
      }
    }
  }
  
  console.log(bestScore);
}

main();
