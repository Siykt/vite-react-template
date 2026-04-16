export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Board = CellValue[][];

const EMPTY: CellValue = 0;
const SIZE = 9;
const BOX = 3;

const CLUES_BY_DIFFICULTY: Record<Difficulty, [number, number]> = {
  easy: [36, 45],
  medium: [27, 35],
  hard: [22, 26],
  expert: [17, 21],
};

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY) as CellValue[]);
}

function isValid(board: Board, row: number, col: number, num: CellValue): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function solve(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== EMPTY) continue;
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]);
      for (const num of nums) {
        if (isValid(board, r, c, num)) {
          board[r][c] = num;
          if (solve(board)) return true;
          board[r][c] = EMPTY;
        }
      }
      return false;
    }
  }
  return true;
}

function countSolutions(board: Board, limit: number): number {
  let count = 0;
  function backtrack(): boolean {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] !== EMPTY) continue;
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num as CellValue)) {
            board[r][c] = num as CellValue;
            if (backtrack()) return true;
            board[r][c] = EMPTY;
          }
        }
        return false;
      }
    }
    count++;
    return count >= limit;
  }
  backtrack();
  return count;
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = createEmptyBoard();
  solve(solution);

  const puzzle = solution.map((row) => [...row]) as Board;

  const [minClues, maxClues] = CLUES_BY_DIFFICULTY[difficulty];
  const targetClues = minClues + Math.floor(Math.random() * (maxClues - minClues + 1));
  const totalToRemove = SIZE * SIZE - targetClues;

  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE] as [number, number])
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= totalToRemove) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = EMPTY;

    const testBoard = puzzle.map((row) => [...row]) as Board;
    if (countSolutions(testBoard, 2) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup;
    }
  }

  return { puzzle, solution };
}

export function checkConflicts(board: Board, row: number, col: number, value: CellValue): boolean {
  if (value === EMPTY) return false;

  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i] === value) return true;
    if (i !== row && board[i][col] === value) return true;
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if (r !== row && c !== col && board[r][c] === value) return true;
    }
  }

  return false;
}

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === EMPTY) return false;
      if (checkConflicts(board, r, c, board[r][c])) return false;
    }
  }
  return true;
}
