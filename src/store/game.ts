import { proxy, subscribe } from 'valtio';
import { type Board, type CellValue, type Difficulty, generatePuzzle, checkConflicts, isBoardComplete } from '@/lib/sudoku';

interface CellState {
  value: CellValue;
  notes: Set<number>;
  isGiven: boolean;
  isError: boolean;
}

interface HistoryEntry {
  row: number;
  col: number;
  prevValue: CellValue;
  prevNotes: Set<number>;
  newValue: CellValue;
  newNotes: Set<number>;
}

interface GameState {
  cells: CellState[][];
  solution: Board;
  selectedRow: number;
  selectedCol: number;
  difficulty: Difficulty;
  noteMode: boolean;
  timer: number;
  isRunning: boolean;
  isComplete: boolean;
  isPaused: boolean;
  darkMode: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  errorCount: number;
}

const STORAGE_KEY = 'sudoku-game-state';

function createCells(puzzle: Board): CellState[][] {
  return puzzle.map((row) =>
    row.map((value) => ({
      value,
      notes: new Set<number>(),
      isGiven: value !== 0,
      isError: false,
    }))
  );
}

function loadDarkMode(): boolean {
  try {
    const saved = localStorage.getItem('sudoku-dark-mode');
    if (saved !== null) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function createInitialState(): GameState {
  const { puzzle, solution } = generatePuzzle('easy');
  return {
    cells: createCells(puzzle),
    solution,
    selectedRow: -1,
    selectedCol: -1,
    difficulty: 'easy',
    noteMode: false,
    timer: 0,
    isRunning: true,
    isComplete: false,
    isPaused: false,
    darkMode: loadDarkMode(),
    history: [],
    historyIndex: -1,
    errorCount: 0,
  };
}

export const gameState = proxy<GameState>(createInitialState());

function updateErrors(): void {
  const board: Board = gameState.cells.map((row) => row.map((cell) => cell.value)) as Board;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      gameState.cells[r][c].isError =
        gameState.cells[r][c].value !== 0 && checkConflicts(board, r, c, gameState.cells[r][c].value);
    }
  }
}

export const actions = {
  newGame(difficulty: Difficulty): void {
    const { puzzle, solution } = generatePuzzle(difficulty);
    gameState.cells = createCells(puzzle);
    gameState.solution = solution;
    gameState.selectedRow = -1;
    gameState.selectedCol = -1;
    gameState.difficulty = difficulty;
    gameState.noteMode = false;
    gameState.timer = 0;
    gameState.isRunning = true;
    gameState.isComplete = false;
    gameState.isPaused = false;
    gameState.history = [];
    gameState.historyIndex = -1;
    gameState.errorCount = 0;
  },

  selectCell(row: number, col: number): void {
    gameState.selectedRow = row;
    gameState.selectedCol = col;
  },

  inputNumber(num: CellValue): void {
    const { selectedRow: r, selectedCol: c } = gameState;
    if (r < 0 || c < 0 || gameState.isComplete) return;
    const cell = gameState.cells[r][c];
    if (cell.isGiven) return;

    const prevValue = cell.value;
    const prevNotes = new Set(cell.notes);

    if (gameState.noteMode) {
      if (num === 0) {
        cell.notes = new Set<number>();
      } else if (cell.notes.has(num)) {
        cell.notes = new Set([...cell.notes].filter((n) => n !== num));
      } else {
        cell.notes = new Set([...cell.notes, num]);
      }
      cell.value = 0 as CellValue;
    } else {
      cell.value = prevValue === num ? (0 as CellValue) : num;
      cell.notes = new Set<number>();
    }

    // push history
    const entry: HistoryEntry = {
      row: r,
      col: c,
      prevValue,
      prevNotes,
      newValue: cell.value,
      newNotes: new Set(cell.notes),
    };
    gameState.history = [...gameState.history.slice(0, gameState.historyIndex + 1), entry];
    gameState.historyIndex = gameState.history.length - 1;

    updateErrors();

    // check errors
    if (cell.value !== 0 && cell.value !== gameState.solution[r][c]) {
      gameState.errorCount++;
    }

    // check completion
    const board: Board = gameState.cells.map((row) => row.map((c) => c.value)) as Board;
    if (isBoardComplete(board)) {
      gameState.isComplete = true;
      gameState.isRunning = false;
    }
  },

  toggleNoteMode(): void {
    gameState.noteMode = !gameState.noteMode;
  },

  undo(): void {
    if (gameState.historyIndex < 0) return;
    const entry = gameState.history[gameState.historyIndex];
    const cell = gameState.cells[entry.row][entry.col];
    cell.value = entry.prevValue;
    cell.notes = new Set(entry.prevNotes);
    gameState.historyIndex--;
    updateErrors();
  },

  redo(): void {
    if (gameState.historyIndex >= gameState.history.length - 1) return;
    gameState.historyIndex++;
    const entry = gameState.history[gameState.historyIndex];
    const cell = gameState.cells[entry.row][entry.col];
    cell.value = entry.newValue;
    cell.notes = new Set(entry.newNotes);
    updateErrors();
  },

  erase(): void {
    const { selectedRow: r, selectedCol: c } = gameState;
    if (r < 0 || c < 0 || gameState.isComplete) return;
    const cell = gameState.cells[r][c];
    if (cell.isGiven) return;
    actions.inputNumber(0 as CellValue);
  },

  togglePause(): void {
    if (gameState.isComplete) return;
    gameState.isPaused = !gameState.isPaused;
    gameState.isRunning = !gameState.isPaused;
  },

  tick(): void {
    if (gameState.isRunning && !gameState.isPaused && !gameState.isComplete) {
      gameState.timer++;
    }
  },

  toggleDarkMode(): void {
    gameState.darkMode = !gameState.darkMode;
    localStorage.setItem('sudoku-dark-mode', JSON.stringify(gameState.darkMode));
  },

  hint(): void {
    const { selectedRow: r, selectedCol: c } = gameState;
    if (r < 0 || c < 0 || gameState.isComplete) return;
    const cell = gameState.cells[r][c];
    if (cell.isGiven) return;

    const correctValue = gameState.solution[r][c];
    cell.value = correctValue;
    cell.notes = new Set<number>();
    cell.isGiven = true;
    updateErrors();

    const board: Board = gameState.cells.map((row) => row.map((c) => c.value)) as Board;
    if (isBoardComplete(board)) {
      gameState.isComplete = true;
      gameState.isRunning = false;
    }
  },
};

// auto-save
function serializeState(): string {
  return JSON.stringify({
    cells: gameState.cells.map((row) =>
      row.map((cell) => ({
        value: cell.value,
        notes: [...cell.notes],
        isGiven: cell.isGiven,
      }))
    ),
    solution: gameState.solution,
    difficulty: gameState.difficulty,
    timer: gameState.timer,
    noteMode: gameState.noteMode,
    errorCount: gameState.errorCount,
    isComplete: gameState.isComplete,
  });
}

export function saveGame(): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeState());
  } catch {
    // storage full
  }
}

export function loadGame(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    const data = JSON.parse(saved);
    if (!data.cells || !data.solution) return false;

    gameState.cells = data.cells.map((row: { value: CellValue; notes: number[]; isGiven: boolean }[]) =>
      row.map((cell) => ({
        value: cell.value,
        notes: new Set(cell.notes),
        isGiven: cell.isGiven,
        isError: false,
      }))
    );
    gameState.solution = data.solution;
    gameState.difficulty = data.difficulty || 'easy';
    gameState.timer = data.timer || 0;
    gameState.noteMode = data.noteMode || false;
    gameState.errorCount = data.errorCount || 0;
    gameState.isComplete = data.isComplete || false;
    gameState.isRunning = !data.isComplete;
    gameState.isPaused = false;
    gameState.selectedRow = -1;
    gameState.selectedCol = -1;
    gameState.history = [];
    gameState.historyIndex = -1;
    updateErrors();
    return true;
  } catch {
    return false;
  }
}

// auto-save on state changes
subscribe(gameState, () => {
  if (!gameState.isComplete) {
    saveGame();
  }
});
