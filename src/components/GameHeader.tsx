import { useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState, actions } from '@/store/game';
import styled from 'styled-components';
import type { Difficulty } from '@/lib/sudoku';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: min(90vw, 450px);
  gap: 12px;
`;

const TimerText = styled.span`
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-given);
  min-width: 60px;
`;

const DifficultySelect = styled.select`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-thin);
  background: var(--btn-bg);
  color: var(--color-given);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;

  &:hover {
    background: var(--btn-bg-hover);
  }
`;

const HeaderBtn = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: var(--btn-bg);
  color: var(--color-given);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--btn-bg-hover);
  }
`;

const ErrorBadge = styled.span`
  font-size: 13px;
  color: var(--color-error);
  font-weight: 500;
`;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

export default function GameHeader() {
  const snap = useSnapshot(gameState);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => actions.tick(), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <Header>
      <DifficultySelect value={snap.difficulty} onChange={(e) => actions.newGame(e.target.value as Difficulty)}>
        {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
          <option key={d} value={d}>
            {DIFFICULTY_LABELS[d]}
          </option>
        ))}
      </DifficultySelect>

      {snap.errorCount > 0 && <ErrorBadge>Errors: {snap.errorCount}</ErrorBadge>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TimerText>{formatTime(snap.timer)}</TimerText>
        <HeaderBtn onClick={() => actions.togglePause()}>{snap.isPaused ? '▶' : '⏸'}</HeaderBtn>
      </div>
    </Header>
  );
}
