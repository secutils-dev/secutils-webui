import React from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiTitle,
} from '@elastic/eui';

export interface Props {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;

  canSave?: boolean;
  saveInProgress?: boolean;
}

export function EditorFlyout({ title, children, onSave, onClose, canSave, saveInProgress }: Props) {
  return (
    <EuiFlyout size="l" maxWidth onClose={onClose} ownFocus>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h1>{title}</h1>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>{children}</EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="cross" onClick={() => onClose()} flush="left">
              Close
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton isLoading={saveInProgress === true} isDisabled={canSave === false} onClick={() => onSave()} fill>
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
}
