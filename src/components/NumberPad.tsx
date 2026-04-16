import { useSnapshot } from 'valtio';
import { gameState, actions } from '@/store/game';
import type { CellValue } from '@/lib/sudoku';
import styled from 'styled-components';

const PadContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
  width: min(90vw, 450px);
`;

interface NumBtnProps {
  $active: boolean;
  $allPlaced: boolean;
}

const NumBtn = styled.button<NumBtnProps>`
  aspect-ratio: 1;
  border: none;
  border-radius: 8px;
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  background: ${(p) => (p.$active ? 'var(--btn-primary)' : 'var(--btn-bg)')};
  color: ${(p) => (p.$active ? '#fff' : p.$allPlaced ? 'var(--color-disabled)' : 'var(--color-given)')};
  opacity: ${(p) => (p.$allPlaced ? 0.4 : 1)};

  &:hover:not(:disabled) {
    background: ${(p) => (p.$active ? 'var(--btn-primary-hover)' : 'var(--btn-bg-hover)')};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

export default function NumberPad() {
  const snap = useSnapshot(gameState);

  const counts = new Map<number, number>();
  for (const row of snap.cells) {
    for (const cell of row) {
      if (cell.value !== 0) {
        counts.set(cell.value, (counts.get(cell.value) || 0) + 1);
      }
    }
  }

  const selectedValue =
    snap.selectedRow >= 0 && snap.selectedCol >= 0 ? snap.cells[snap.selectedRow][snap.selectedCol].value : 0;

  return (
    <PadContainer>
      {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map((num) => (
        <NumBtn
          key={num}
          $active={selectedValue === num}
          $allPlaced={(counts.get(num) || 0) >= 9}
          onClick={() => actions.inputNumber(num)}
        >
          {num}
        </NumBtn>
      ))}
    </PadContainer>
  );
}
