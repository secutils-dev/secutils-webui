import type { ChangeEvent, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiTitle,
} from '@elastic/eui';
import axios from 'axios';

import { useAppContext } from '../../hooks';
import type { AsyncData } from '../../model';
import { getApiUrl, getErrorMessage } from '../../model';

export interface ResetCredentialsModalProps {
  email?: string;
  onClose: () => void;
}

export function ResetCredentialsModal({ email, onClose }: ResetCredentialsModalProps) {
  const { addToast } = useAppContext();

  const [userEmail, setUserEmail] = useState<string>(email ?? '');
  const onUserEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value);
  }, []);

  const [passwordResetStatus, setPasswordResetStatus] = useState<AsyncData<undefined> | null>(null);
  const onResetPassword: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (passwordResetStatus?.status === 'pending') {
        return;
      }

      setPasswordResetStatus({ status: 'pending' });

      axios.post(getApiUrl('/api/credentials/send_link'), { email: userEmail }).then(
        () => {
          setPasswordResetStatus({ status: 'succeeded', data: undefined });
          setUserEmail('');

          addToast({
            id: 'send-password-reset-link',
            color: 'success',
            title: 'Password reset link sent',
            text: (
              <>
                Password reset link on its way to your email. If you don't see it soon, please check your spam folder.
              </>
            ),
          });

          onClose();
        },
        (err: Error) => {
          setPasswordResetStatus({ status: 'failed', error: getErrorMessage(err) });

          addToast({
            id: 'end-password-reset-link',
            color: 'danger',
            title: 'Failed to send password reset link',
            text: <>Unable to send password reset link, please try again later.</>,
          });
        },
      );
    },
    [userEmail, passwordResetStatus],
  );

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size={'s'}>
            <span>Reset your password</span>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiForm id="reset-password-form" component="form">
          <EuiFormRow label="Email">
            <EuiFieldText value={userEmail} type={'email'} autoComplete="email" required onChange={onUserEmailChange} />
          </EuiFormRow>
        </EuiForm>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty disabled={passwordResetStatus?.status === 'pending'} onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton
          type="submit"
          form="reset-password-form"
          fill
          disabled={passwordResetStatus?.status === 'pending' || !userEmail?.trim()}
          onClick={onResetPassword}
          isLoading={passwordResetStatus?.status === 'pending'}
        >
          Send reset link
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
