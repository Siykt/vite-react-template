import { useSnapshot } from 'valtio';
import { gameState, actions } from '@/store/game';
import styled from 'styled-components';

const Bar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  width: min(90vw, 450px);
`;

interface CtrlBtnProps {
  $active?: boolean;
}

const CtrlBtn = styled.button<CtrlBtnProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  background: ${(p) => (p.$active ? 'var(--btn-primary)' : 'var(--btn-bg)')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--color-given)')};
  transition: all 0.15s;
  min-width: 56px;

  &:hover {
    background: ${(p) => (p.$active ? 'var(--btn-primary-hover)' : 'var(--btn-bg-hover)')};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Icon = styled.span`
  font-size: 20px;
`;

export default function ControlBar() {
  const snap = useSnapshot(gameState);

  return (
    <Bar>
      <CtrlBtn onClick={() => actions.undo()} disabled={snap.historyIndex < 0}>
        <Icon>↩</Icon>
        Undo
      </CtrlBtn>
      <CtrlBtn onClick={() => actions.redo()} disabled={snap.historyIndex >= snap.history.length - 1}>
        <Icon>↪</Icon>
        Redo
      </CtrlBtn>
      <CtrlBtn onClick={() => actions.erase()}>
        <Icon>⌫</Icon>
        Erase
      </CtrlBtn>
      <CtrlBtn $active={snap.noteMode} onClick={() => actions.toggleNoteMode()}>
        <Icon>✏</Icon>
        Notes
      </CtrlBtn>
      <CtrlBtn onClick={() => actions.hint()}>
        <Icon>💡</Icon>
        Hint
      </CtrlBtn>
    </Bar>
  );
}
