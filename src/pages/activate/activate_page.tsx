import { EuiLink } from '@elastic/eui';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PageErrorState, PageLoadingState, PageSuccessState } from '../../components';
import { usePageMeta } from '../../hooks';
import { type AsyncData, getApiUrl } from '../../model';
import { Page } from '../page';

export function ActivatePage() {
  usePageMeta('Activate');

  const location = useLocation();
  const navigate = useNavigate();

  const [activationStatus, setActivationStatus] = useState<AsyncData<undefined>>({ status: 'pending' });
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const activationCode = queryParams.get('code');
    if (!email || !activationCode) {
      setActivationStatus({
        status: 'failed',
        error:
          'The activation link is not valid or may have already expired. You can request a new link from the account settings.',
      });
      return;
    }

    axios.post(getApiUrl('/api/activation/complete'), { email, activationCode }).then(
      () => {
        setActivationStatus({ status: 'succeeded', data: undefined });
      },
      () => {
        setActivationStatus({
          status: 'failed',
          error:
            'The activation link is not valid or may have already expired. You can request a new link from the account settings.',
        });
      },
    );
  }, [location.search]);

  const loginLink = (
    <p>
      <EuiLink
        href={'/login'}
        onClick={(e) => {
          e.preventDefault();
          navigate('/login');
        }}
      >
        Go to the login page
      </EuiLink>
    </p>
  );

  const pageContent =
    activationStatus.status === 'pending' ? (
      <PageLoadingState title={'Activating your account…'} />
    ) : activationStatus.status === 'failed' ? (
      <PageErrorState title="Cannot activate account" content={<p>{activationStatus.error}</p>} action={loginLink} />
    ) : (
      <PageSuccessState
        title="Successfully activated account"
        content={<p>Your account has been successfully activated!</p>}
        action={loginLink}
      />
    );

  return <Page contentAlignment={'center'}>{pageContent}</Page>;
}
