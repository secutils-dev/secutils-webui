import type { ChangeEvent, MouseEventHandler } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { EuiButton, EuiButtonEmpty, EuiFieldText, EuiForm, EuiFormRow, EuiLink, EuiPanel } from '@elastic/eui';
import axios from 'axios';

import { PageErrorState, PageSuccessState } from '../../components';
import { useAppContext, usePageMeta } from '../../hooks';
import { type AsyncData, getApiUrl } from '../../model';
import { getErrorMessage, isClientError } from '../../model/errors';
import { Page } from '../page';

export function ResetCredentialsPage() {
  usePageMeta('Reset credentials');

  const location = useLocation();
  const navigate = useNavigate();

  const { addToast } = useAppContext();

  const [email, resetCode] = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return [queryParams.get('email'), queryParams.get('code')];
  }, [location.search]);

  const [password, setPassword] = useState<string>('');
  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const onRepeatPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(e.target.value);
  }, []);

  const [resetStatus, setResetStatus] = useState<AsyncData<undefined> | null>(null);
  const onResetPassword: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (resetStatus?.status === 'pending') {
        return;
      }

      setResetStatus({ status: 'pending' });
      axios.post(getApiUrl('/api/credentials/password/reset'), { email, password, resetCode }).then(
        () => {
          setResetStatus({ status: 'succeeded', data: undefined });
        },
        (err: Error) => {
          const originalErrorMessage = getErrorMessage(err);
          setResetStatus({
            status: 'failed',
            error: originalErrorMessage,
          });

          addToast({
            id: 'change-password',
            color: 'danger',
            title: 'Failed to change password',
            text: (
              <>
                {isClientError(err)
                  ? originalErrorMessage
                  : 'We were unable to change your password, please request a new password reset link from the sign-in page or contact us.'}
              </>
            ),
          });
        },
      );
    },
    [email, password, resetCode, resetStatus],
  );

  const signinLink = (
    <EuiLink
      href={'/signin'}
      onClick={(e) => {
        e.preventDefault();
        navigate('/signin');
      }}
    >
      Sign in
    </EuiLink>
  );

  // If password reset link isn't valid, display error prompt.
  if (!email || !resetCode) {
    return (
      <Page contentAlignment={'center'}>
        <PageErrorState
          title="Cannot reset password"
          content={
            <p>
              The password reset link is not valid or may have already expired. You can request a new link from the
              sign-in page.
            </p>
          }
          action={<p>{signinLink}</p>}
        />
      </Page>
    );
  }

  // Once password is changed direct user to the sign-in page.
  if (resetStatus?.status === 'succeeded') {
    return (
      <Page contentAlignment={'center'}>
        <PageSuccessState
          title="Successfully changed password"
          content={<p>Your password has been successfully changed!</p>}
          action={<p>{signinLink}</p>}
        />
      </Page>
    );
  }

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="reset-password-form" component="form" autoComplete="off" fullWidth className="password-form">
          <EuiFormRow isDisabled={true}>
            <EuiFieldText placeholder="Email" value={email} type={'email'} disabled />
          </EuiFormRow>
          <EuiFormRow>
            <EuiFieldText
              placeholder="New password"
              value={password}
              type={'password'}
              autoComplete="new-password"
              disabled={resetStatus?.status === 'pending'}
              onChange={onPasswordChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiFieldText
              placeholder="Repeat new password"
              value={repeatPassword}
              type={'password'}
              autoComplete="new-password"
              isInvalid={!!repeatPassword && !!password && repeatPassword !== password}
              disabled={resetStatus?.status === 'pending'}
              onChange={onRepeatPasswordChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton
              type="submit"
              form="reset-password-form"
              fill
              fullWidth
              onClick={onResetPassword}
              isLoading={resetStatus?.status === 'pending'}
              isDisabled={
                email.trim().length === 0 ||
                password.trim().length === 0 ||
                password !== repeatPassword ||
                resetStatus?.status === 'pending'
              }
            >
              Change password
            </EuiButton>
          </EuiFormRow>
          <EuiFormRow className="eui-textCenter">
            <EuiButtonEmpty
              size={'xs'}
              onClick={() => {
                navigate('/signin');
              }}
            >
              Sign in
            </EuiButtonEmpty>
          </EuiFormRow>
        </EuiForm>
      </EuiPanel>
    </Page>
  );
}
