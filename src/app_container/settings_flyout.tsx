import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';

import type { EuiThemeColorMode } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiConfirmModal,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiLink,
  EuiSelect,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { css } from '@emotion/react';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { unix, utc } from 'moment/moment';

import { useAppContext } from '../hooks';
import type { AsyncData } from '../model';
import { getApiUrl, USER_SETTINGS_KEY_COMMON_UI_THEME } from '../model';
import { updatePasskey } from '../model/webauthn';
import { isWebAuthnSupported } from '../tools/webauthn';

export interface Props {
  onClose: () => void;
}

export function SettingsFlyout({ onClose }: Props) {
  const { settings, setSettings, uiState, refreshUiState, addToast } = useAppContext();

  const uiTheme = settings?.[USER_SETTINGS_KEY_COMMON_UI_THEME] as EuiThemeColorMode | undefined;
  const onThemeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSettings({ [USER_SETTINGS_KEY_COMMON_UI_THEME]: e.target.value });
      if (e.target.value === 'light') {
        setTimeout(() => window.location.reload(), 100);
      }
    },
    [settings],
  );

  const [isPasskeySupported] = useState<boolean>(isWebAuthnSupported());

  const [password, setPassword] = useState<string>('');
  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const onRepeatPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(e.target.value);
  }, []);

  const [isRemoveCredentialsModalVisible, setIsRemoveCredentialsModalVisible] = useState<
    { visible: false } | { visible: true; credentials: 'password' | 'passkey' }
  >({ visible: false });
  const [removeCredentialsStatus, setRemoveCredentialsStatus] = useState<AsyncData<
    null,
    'password' | 'passkey'
  > | null>(null);
  const onRemoveCredentials = useCallback(
    (credentials: 'password' | 'passkey') => {
      if (removeCredentialsStatus?.status === 'pending') {
        return;
      }

      setRemoveCredentialsStatus({ status: 'pending', state: credentials });
      axios.delete(getApiUrl(`/api/credentials/${credentials}`)).then(
        () => {
          setRemoveCredentialsStatus({ status: 'succeeded', data: null });

          addToast({
            id: 'remove-credentials',
            color: 'success',
            title: `${credentials === 'password' ? 'Password' : 'Passkey'} has been removed.`,
          });

          refreshUiState();
        },
        (err: AxiosError<{ message: string }>) => {
          setRemoveCredentialsStatus({
            status: 'failed',
            error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
          });
          addToast({
            id: 'remove-credentials',
            color: 'danger',
            title: `Failed to remove ${credentials}`,
            text: <>Unable to delete your ${credentials}, please try again later.</>,
          });
        },
      );
    },
    [refreshUiState],
  );

  const [updatePasswordStatus, setUpdatePasswordStatus] = useState<AsyncData<null> | null>(null);
  const onUpdatePassword = useCallback(() => {
    if (updatePasswordStatus?.status === 'pending' || password !== repeatPassword) {
      return;
    }

    setUpdatePasswordStatus({ status: 'pending' });
    axios.post(getApiUrl('/api/credentials/password'), { password }).then(
      () => {
        setUpdatePasswordStatus({ status: 'succeeded', data: null });
        setPassword('');
        setRepeatPassword('');

        addToast({
          id: 'update-password',
          color: 'success',
          title: 'Password has been updated',
        });

        refreshUiState();
      },
      (err: AxiosError<{ message: string }>) => {
        setUpdatePasswordStatus({
          status: 'failed',
          error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
        });
        addToast({
          id: 'update-password',
          color: 'danger',
          title: 'Failed to update password',
          text: <>Unable to update password, please try again later.</>,
        });
      },
    );
  }, [password, repeatPassword, refreshUiState]);

  const [updatePasskeyStatus, setUpdatePasskeyStatus] = useState<AsyncData<null> | null>(null);
  const onUpdatePasskey = useCallback(() => {
    if (updatePasskeyStatus?.status === 'pending') {
      return;
    }

    setUpdatePasskeyStatus({ status: 'pending' });
    updatePasskey().then(
      () => {
        setUpdatePasskeyStatus({ status: 'succeeded', data: null });

        addToast({
          id: 'update-passkey',
          color: 'success',
          title: 'Passkey has been updated',
        });

        refreshUiState();
      },
      (err: AxiosError<{ message: string }>) => {
        setUpdatePasskeyStatus({
          status: 'failed',
          error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
        });
        addToast({
          id: 'update-passkey',
          color: 'danger',
          title: 'Failed to update passkey',
          text: <>Unable to update passkey, please try again later.</>,
        });
      },
    );
  }, [refreshUiState]);

  const [sendActivationLinkStatus, setSendActivationLinkStatus] = useState<AsyncData<null> | null>(null);
  const onSendActivationLink = useCallback(() => {
    if (sendActivationLinkStatus?.status === 'pending') {
      return;
    }

    setSendActivationLinkStatus({ status: 'pending' });
    axios.post(getApiUrl('/api/activation/send_link')).then(
      () => {
        setSendActivationLinkStatus({ status: 'succeeded', data: null });
        addToast({
          id: 'send-activation-link',
          color: 'success',
          title: 'Activation link sent',
          text: <>Activation link on its way to your email. If you don't see it soon, please check your spam folder.</>,
        });

        refreshUiState();
      },
      (err: AxiosError<{ message: string }>) => {
        setSendActivationLinkStatus({
          status: 'failed',
          error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
        });
        addToast({
          id: 'send-activation-link',
          color: 'danger',
          title: 'Failed to send activation link',
          text: <>Unable to send activation link, please try again later.</>,
        });
      },
    );
  }, [refreshUiState]);

  const changeInProgress =
    removeCredentialsStatus?.status === 'pending' ||
    updatePasswordStatus?.status === 'pending' ||
    updatePasskeyStatus?.status === 'pending';

  const canRemovePasskey = uiState.user?.credentials.password && uiState.user?.credentials.passkey;
  const passkeySection =
    isPasskeySupported || canRemovePasskey ? (
      <EuiFormRow fullWidth>
        {canRemovePasskey ? (
          <EuiButton
            fullWidth
            color={'danger'}
            disabled={changeInProgress}
            onClick={() => setIsRemoveCredentialsModalVisible({ visible: true, credentials: 'passkey' })}
            isLoading={removeCredentialsStatus?.status === 'pending'}
          >
            Remove passkey
          </EuiButton>
        ) : (
          <EuiButton
            fullWidth
            disabled={changeInProgress}
            onClick={onUpdatePasskey}
            isLoading={updatePasskeyStatus?.status === 'pending' && removeCredentialsStatus?.state === 'passkey'}
          >
            {uiState.user?.credentials.passkey ? 'Change passkey' : 'Add passkey'}
          </EuiButton>
        )}
      </EuiFormRow>
    ) : null;

  const [selectedTab, setSelectedTab] = useState<'general' | 'security' | 'account'>('general');
  let selectedTabContent;
  if (selectedTab === 'general') {
    selectedTabContent = (
      <EuiDescribedFormGroup title={<h3>Appearance</h3>} description={'Customize Secutils.dev appearance'}>
        <EuiFormRow label="Theme" fullWidth>
          <EuiSelect
            options={[
              { value: 'light', text: 'Light' },
              { value: 'dark', text: 'Dark' },
            ]}
            value={uiTheme ?? 'light'}
            onChange={onThemeChange}
          />
        </EuiFormRow>
      </EuiDescribedFormGroup>
    );
  } else if (selectedTab === 'security') {
    selectedTabContent = (
      <EuiDescribedFormGroup title={<h3>Credentials</h3>} description={'Configure your Secutils.dev credentials'}>
        <EuiFormRow fullWidth isDisabled={changeInProgress}>
          <EuiFieldText
            placeholder={uiState.user?.credentials.password ? 'New password' : 'Password'}
            type={'password'}
            autoComplete="new-password"
            onChange={onPasswordChange}
            minLength={8}
            value={password}
          />
        </EuiFormRow>
        <EuiFormRow fullWidth isDisabled={changeInProgress}>
          <EuiFieldText
            placeholder={uiState.user?.credentials.password ? 'Repeat new password' : 'Repeat password'}
            type={'password'}
            autoComplete="new-password"
            onChange={onRepeatPasswordChange}
            minLength={8}
            isInvalid={repeatPassword !== password}
            value={repeatPassword}
          />
        </EuiFormRow>
        <EuiFormRow fullWidth>
          <EuiFlexGroup justifyContent={'spaceBetween'} wrap>
            <EuiFlexItem>
              <EuiButton
                disabled={password !== repeatPassword || password.length < 8 || changeInProgress}
                isLoading={updatePasswordStatus?.status === 'pending'}
                onClick={onUpdatePassword}
              >
                {uiState.user?.credentials.password ? 'Change password' : 'Add password'}
              </EuiButton>
            </EuiFlexItem>
            {uiState.user?.credentials.password && uiState.user?.credentials.passkey && isPasskeySupported ? (
              <EuiFlexItem>
                <EuiButton
                  color="danger"
                  onClick={() => setIsRemoveCredentialsModalVisible({ visible: true, credentials: 'password' })}
                  disabled={changeInProgress}
                  isLoading={
                    removeCredentialsStatus?.status === 'pending' && removeCredentialsStatus?.state === 'password'
                  }
                >
                  Remove password
                </EuiButton>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
        </EuiFormRow>
        {passkeySection}
      </EuiDescribedFormGroup>
    );
  } else {
    const subscription = uiState.user?.subscription;
    let trialSection = null;
    if (subscription?.trialStartedAt && (subscription?.tier === 'basic' || subscription?.tier === 'standard')) {
      let text;
      if (subscription?.trialEndsAt !== undefined) {
        const nowUtc = utc();
        const trialEndsAtUtc = unix(subscription?.trialEndsAt);
        text = trialEndsAtUtc.isSameOrBefore(nowUtc) ? (
          <EuiText size={'s'} color={'danger'}>
            <b>Expired</b>
          </EuiText>
        ) : (
          <EuiText size={'s'} color={'success'}>
            <b>Active</b> (
            {(trialEndsAtUtc.diff(nowUtc, 'days') || 1).toLocaleString('en-GB', {
              style: 'unit',
              unit: 'day',
              unitDisplay: 'long',
            })}{' '}
            left)
          </EuiText>
        );
      }
      trialSection = (
        <EuiFormRow label="Trial" helpText={'Trial gives you access to all available Secutils.dev features.'} fullWidth>
          {text ?? <EuiText size={'s'}>-</EuiText>}
        </EuiFormRow>
      );
    }

    const subscriptionDescription = <span>View and manage your current Secutils.dev subscription</span>;
    selectedTabContent = (
      <>
        <EuiDescribedFormGroup
          title={<h3>Account</h3>}
          description={
            <>
              <span>Manage your Secutils.dev account</span>
              <br />
              <br />
              <EuiButtonEmpty
                iconType={'trash'}
                color={'danger'}
                title={'The action is not supported yet. Please, contact us instead.'}
                isDisabled
                flush={'left'}
              >
                Delete account
              </EuiButtonEmpty>
            </>
          }
        >
          <EuiFormRow label={'Email'} helpText={'Used for all communications and notifications.'} fullWidth isDisabled>
            <EuiFieldText type={'email'} value={uiState.user?.email} />
          </EuiFormRow>
          {uiState.user?.activated ? null : (
            <EuiFormRow
              fullWidth
              isDisabled={sendActivationLinkStatus?.status === 'pending'}
              title={'Resend account activation link'}
            >
              <EuiButton
                fullWidth
                disabled={sendActivationLinkStatus?.status === 'pending'}
                isLoading={sendActivationLinkStatus?.status === 'pending'}
                onClick={onSendActivationLink}
              >
                Send activation link
              </EuiButton>
            </EuiFormRow>
          )}
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Subscription</h3>}
          description={
            uiState.subscription?.manageUrl ? (
              <>
                {subscriptionDescription}
                <br />
                <br />
                <EuiButtonEmpty
                  iconType={'payment'}
                  flush={'left'}
                  href={uiState.subscription.manageUrl}
                  target="_blank"
                >
                  Manage subscription
                </EuiButtonEmpty>
              </>
            ) : (
              subscriptionDescription
            )
          }
        >
          <EuiFormRow
            label="Tier"
            helpText={
              uiState.subscription?.featureOverviewUrl ? (
                <span>
                  Compare your current tier to other available tiers at the{' '}
                  <EuiLink target="_blank" href={uiState.subscription.featureOverviewUrl}>
                    <b>feature overview page</b>
                  </EuiLink>
                  .
                </span>
              ) : null
            }
            fullWidth
          >
            <EuiText
              css={css`
                text-transform: capitalize;
              `}
              size={'s'}
            >
              <b>{subscription?.tier ?? ''}</b>
            </EuiText>
          </EuiFormRow>
          {trialSection}
        </EuiDescribedFormGroup>
      </>
    );
  }

  const removeCredentialsConfirmModal = isRemoveCredentialsModalVisible.visible ? (
    <EuiConfirmModal
      title={`Remove ${isRemoveCredentialsModalVisible.credentials}?`}
      onCancel={() => setIsRemoveCredentialsModalVisible({ visible: false })}
      onConfirm={() => {
        setIsRemoveCredentialsModalVisible({ visible: false });
        onRemoveCredentials(isRemoveCredentialsModalVisible.credentials);
      }}
      cancelButtonText="Cancel"
      confirmButtonText="Remove"
      buttonColor="danger"
    >
      You will not be able to sign in with {isRemoveCredentialsModalVisible.credentials} anymore.
    </EuiConfirmModal>
  ) : null;

  return (
    <EuiFlyout
      size="m"
      maxWidth
      onClose={() => onClose()}
      ownFocus={true}
      maskProps={{ headerZindexLocation: 'above' }}
    >
      <EuiFlyoutHeader>
        <EuiTitle size="s">
          <h1>Settings</h1>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiTabs>
          <EuiTab onClick={() => setSelectedTab('general')} isSelected={selectedTab === 'general'}>
            General
          </EuiTab>
          <EuiTab onClick={() => setSelectedTab('security')} isSelected={selectedTab === 'security'}>
            Security
          </EuiTab>
          <EuiTab onClick={() => setSelectedTab('account')} isSelected={selectedTab === 'account'}>
            Account
          </EuiTab>
        </EuiTabs>
        <EuiSpacer />
        {selectedTabContent}
        {removeCredentialsConfirmModal}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
