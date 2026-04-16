import { useEffect, useCallback } from 'react';
import { useSnapshot } from 'valtio';
import { gameState, actions, loadGame } from '@/store/game';
import SudokuBoard from '@/components/SudokuBoard';
import NumberPad from '@/components/NumberPad';
import ControlBar from '@/components/ControlBar';
import GameHeader from '@/components/GameHeader';
import type { CellValue } from '@/lib/sudoku';
import styled from 'styled-components';

const PageContainer = styled.div<{ $dark: boolean }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg);
  transition: background 0.3s;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-given);
  letter-spacing: 2px;
`;

const ThemeToggle = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--btn-bg);
  color: var(--color-given);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--btn-bg-hover);
    transform: scale(1.1);
  }
`;

const WinOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const WinCard = styled.div`
  background: var(--bg);
  padding: 32px 48px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  h2 {
    font-size: 28px;
    color: var(--color-given);
    margin-bottom: 8px;
  }

  p {
    color: var(--color-note);
    margin-bottom: 20px;
  }
`;

const PlayAgainBtn = styled.button`
  padding: 10px 32px;
  border: none;
  border-radius: 8px;
  background: var(--btn-primary);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--btn-primary-hover);
    transform: scale(1.05);
  }
`;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const App = () => {
  const snap = useSnapshot(gameState);

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', snap.darkMode ? 'dark' : 'light');
  }, [snap.darkMode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (snap.isComplete || snap.isPaused) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        actions.inputNumber(num as CellValue);
        return;
      }

      switch (e.key) {
        case 'Backspace':
        case 'Delete':
        case '0':
          actions.erase();
          break;
        case 'ArrowUp':
          if (snap.selectedRow > 0) actions.selectCell(snap.selectedRow - 1, snap.selectedCol);
          break;
        case 'ArrowDown':
          if (snap.selectedRow < 8) actions.selectCell(snap.selectedRow + 1, snap.selectedCol);
          break;
        case 'ArrowLeft':
          if (snap.selectedCol > 0) actions.selectCell(snap.selectedRow, snap.selectedCol - 1);
          break;
        case 'ArrowRight':
          if (snap.selectedCol < 8) actions.selectCell(snap.selectedRow, snap.selectedCol + 1);
          break;
        case 'n':
        case 'N':
          actions.toggleNoteMode();
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.shiftKey ? actions.redo() : actions.undo();
          }
          break;
      }
    },
    [snap.selectedRow, snap.selectedCol, snap.isComplete, snap.isPaused]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <PageContainer $dark={snap.darkMode}>
      <ThemeToggle onClick={() => actions.toggleDarkMode()}>
        {snap.darkMode ? '☀' : '🌙'}
      </ThemeToggle>

      <Title>SUDOKU</Title>

      <GameHeader />
      <SudokuBoard />
      <ControlBar />
      <NumberPad />

      {snap.isComplete && (
        <WinOverlay onClick={() => actions.newGame(snap.difficulty)}>
          <WinCard onClick={(e) => e.stopPropagation()}>
            <h2>Congratulations!</h2>
            <p>
              Time: {formatTime(snap.timer)} | Errors: {snap.errorCount}
            </p>
            <PlayAgainBtn onClick={() => actions.newGame(snap.difficulty)}>Play Again</PlayAgainBtn>
          </WinCard>
        </WinOverlay>
      )}
    </PageContainer>
  );
};

export default App;
