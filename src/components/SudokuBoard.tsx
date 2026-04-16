import { useSnapshot } from 'valtio';
import { gameState, actions } from '@/store/game';
import styled from 'styled-components';

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 0;
  width: min(90vw, 450px);
  aspect-ratio: 1;
  border: 3px solid var(--border-thick);
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
`;

interface CellBoxProps {
  $selected: boolean;
  $sameRow: boolean;
  $sameCol: boolean;
  $sameBox: boolean;
  $sameValue: boolean;
  $isGiven: boolean;
  $isError: boolean;
  $rightBorder: boolean;
  $bottomBorder: boolean;
}

const CellBox = styled.div<CellBoxProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  font-size: clamp(14px, 4vw, 24px);
  font-weight: ${(p) => (p.$isGiven ? 700 : 400)};
  cursor: pointer;
  position: relative;
  transition: background-color 0.1s;

  border-right: ${(p) => (p.$rightBorder ? '2px solid var(--border-thick)' : '1px solid var(--border-thin)')};
  border-bottom: ${(p) => (p.$bottomBorder ? '2px solid var(--border-thick)' : '1px solid var(--border-thin)')};

  background-color: ${(p) => {
    if (p.$selected) return 'var(--cell-selected)';
    if (p.$sameValue) return 'var(--cell-same-value)';
    if (p.$sameRow || p.$sameCol || p.$sameBox) return 'var(--cell-highlight)';
    return 'var(--cell-bg)';
  }};

  color: ${(p) => {
    if (p.$isError) return 'var(--color-error)';
    if (p.$isGiven) return 'var(--color-given)';
    return 'var(--color-input)';
  }};

  &:hover {
    background-color: ${(p) => (p.$selected ? 'var(--cell-selected)' : 'var(--cell-hover)')};
  }
`;

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
`;

const NoteNum = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(6px, 1.5vw, 10px);
  color: var(--color-note);
  line-height: 1;
`;

export default function SudokuBoard() {
  const snap = useSnapshot(gameState);
  const { selectedRow, selectedCol, isPaused } = snap;

  const selectedValue = selectedRow >= 0 && selectedCol >= 0 ? snap.cells[selectedRow][selectedCol].value : 0;

  if (isPaused) {
    return (
      <BoardContainer>
        <div
          style={{
            gridColumn: '1 / -1',
            gridRow: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'var(--color-given)',
            background: 'var(--cell-bg)',
          }}
        >
          Paused
        </div>
      </BoardContainer>
    );
  }

  return (
    <BoardContainer>
      {snap.cells.map((row, r) =>
        row.map((cell, c) => {
          const selected = r === selectedRow && c === selectedCol;
          const sameRow = r === selectedRow;
          const sameCol = c === selectedCol;
          const sameBox =
            selectedRow >= 0 &&
            Math.floor(r / 3) === Math.floor(selectedRow / 3) &&
            Math.floor(c / 3) === Math.floor(selectedCol / 3);
          const sameValue = selectedValue !== 0 && cell.value === selectedValue;

          return (
            <CellBox
              key={`${r}-${c}`}
              $selected={selected}
              $sameRow={sameRow}
              $sameCol={sameCol}
              $sameBox={sameBox}
              $sameValue={sameValue}
              $isGiven={cell.isGiven}
              $isError={cell.isError}
              $rightBorder={(c + 1) % 3 === 0 && c < 8}
              $bottomBorder={(r + 1) % 3 === 0 && r < 8}
              onClick={() => actions.selectCell(r, c)}
            >
              {cell.value !== 0 ? (
                cell.value
              ) : cell.notes.size > 0 ? (
                <NotesGrid>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <NoteNum key={n}>{cell.notes.has(n) ? n : ''}</NoteNum>
                  ))}
                </NotesGrid>
              ) : null}
            </CellBox>
          );
        })
      )}
    </BoardContainer>
  );
}
