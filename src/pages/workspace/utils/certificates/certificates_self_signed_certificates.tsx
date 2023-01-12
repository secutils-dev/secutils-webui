import type { Pagination, PropertySort, Criteria } from '@elastic/eui';
import {
  EuiButton,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiEmptyPrompt,
  EuiIcon,
  EuiInMemoryTable,
  EuiText,
  EuiToolTip,
  EuiSpacer,
  EuiLink,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { PageContext } from '../../../../page_container';
import { PageLoadingState } from '../../../../components';
import { WorkspaceContext } from '../../workspace_context';
import type { SelfSignedCertificate, SerializedSelfSignedCertificate } from './self_signed_certificate';
import {
  deserializeSelfSignedCertificate,
  getDistinguishedNameString,
  publicKeyAlgorithmString,
  SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE,
  signatureAlgorithmString,
} from './self_signed_certificate';
import { SaveSelfSignedCertificatesFlyout } from './save_self_signed_certificate_flyout';
import moment from 'moment';
import { CertificateFormatModal } from './certificate_format_modal';

type SelfSignedCertificatesDataType = {
  [SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE]: Record<string, SerializedSelfSignedCertificate> | null;
};

function parseSelfSignedCertificates(data: SelfSignedCertificatesDataType): SelfSignedCertificate[] {
  const certificates = data[SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE];
  if (!certificates) {
    return [];
  }

  try {
    return Object.values(certificates).map(deserializeSelfSignedCertificate);
  } catch {
    return [];
  }
}

export default function CertificatesSelfSignedCertificates() {
  const { uiState, setUserData, getUserData } = useContext(PageContext);
  const { setTitleActions } = useContext(WorkspaceContext);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<
    { isOpen: false } | { isOpen: true; certificate: SelfSignedCertificate }
  >({ isOpen: false });
  const onToggleGenerateModal = useCallback((certificate?: SelfSignedCertificate) => {
    if (certificate) {
      setIsGenerateModalOpen({ isOpen: true, certificate });
    } else {
      setIsGenerateModalOpen({ isOpen: false });
    }
  }, []);

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<
    { isOpen: false } | { isOpen: true; certificate?: SelfSignedCertificate }
  >({ isOpen: false });
  const onToggleEditFlyout = useCallback(
    (hintReload?: boolean) => {
      if (hintReload) {
        reloadCertificates();
      }
      setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
    },
    [getUserData],
  );

  const createButton = (
    <EuiButton
      iconType={'plusInCircle'}
      title="Create a new certificate template"
      fill
      onClick={() => onToggleEditFlyout()}
    >
      Create certificate template
    </EuiButton>
  );

  const [certificates, setCertificates] = useState<SelfSignedCertificate[] | null>(null);
  const reloadCertificates = useCallback(() => {
    getUserData<SelfSignedCertificatesDataType>(SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE).then(
      (data) => {
        const parsedCertificates = parseSelfSignedCertificates(data);
        setCertificates(parsedCertificates);
        setTitleActions(parsedCertificates.length === 0 ? null : createButton);
      },
      () => {
        setCertificates([]);
        setTitleActions(null);
      },
    );
  }, [getUserData]);

  useEffect(() => {
    if (uiState.synced && uiState.user) {
      reloadCertificates();
    }
  }, [uiState, reloadCertificates]);

  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <SaveSelfSignedCertificatesFlyout onClose={onToggleEditFlyout} certificate={isEditFlyoutOpen.certificate} />
  ) : null;

  const generateModal = isGenerateModalOpen.isOpen ? (
    <CertificateFormatModal onClose={() => onToggleGenerateModal()} certificate={isGenerateModalOpen.certificate} />
  ) : null;

  const onRemoveCertificate = useCallback(
    (certificate: SelfSignedCertificate) => {
      setUserData(SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE, { [certificate.name]: null }).then(
        reloadCertificates,
        reloadCertificates,
      );
    },
    [reloadCertificates],
  );

  const onEditCertificate = useCallback((certificate: SelfSignedCertificate) => {
    setIsEditFlyoutOpen({ isOpen: true, certificate: certificate });
  }, []);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const [sorting, setSorting] = useState<{ sort: PropertySort }>({ sort: { field: 'alias', direction: 'asc' } });
  const onTableChange = useCallback(
    ({ page, sort }: Criteria<SelfSignedCertificate>) => {
      setPagination({
        ...pagination,
        pageIndex: page?.index ?? 0,
        pageSize: page?.size ?? 15,
      });

      if (sort?.field) {
        setSorting({ sort });
      }
    },
    [pagination],
  );

  if (!uiState.synced || !uiState.user || !certificates) {
    return <PageLoadingState />;
  }

  let content;
  if (certificates.length === 0) {
    content = (
      <EuiFlexGroup
        direction={'column'}
        gutterSize={'s'}
        justifyContent="center"
        alignItems="center"
        style={{ height: '100%' }}
      >
        <EuiFlexItem>
          <EuiEmptyPrompt
            icon={<EuiIcon type={'securityApp'} size={'xl'} />}
            title={<h2>You don't have any certificate templates yet</h2>}
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
            body={
              <div>
                <p>Go ahead and create your first self-signed certificate template.</p>
                {createButton}
              </div>
            }
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  } else {
    content = (
      <>
        <EuiCallOut
          title="Don't use self-signed certificates in production environments"
          color="warning"
          iconType="alert"
        >
          <p>
            Self-signed certificates generated through Secutils.dev are intended for use in development and testing
            environments only. Please do not use these certificates in production environments unless you are running{' '}
            <EuiLink target="_blank" href="https://github.com/secutils-dev/secutils">
              your own version
            </EuiLink>{' '}
            of the Secutils.dev in a trusted and controlled environment.
          </p>
          <EuiButton color="accent">Do not show again</EuiButton>
        </EuiCallOut>
        <EuiSpacer />
        <EuiInMemoryTable
          pagination={pagination}
          allowNeutralSort={false}
          sorting={sorting}
          onTableChange={onTableChange}
          items={certificates}
          itemId={(certificate) => certificate.name}
          tableLayout={'auto'}
          columns={[
            {
              name: (
                <EuiToolTip content="A unique name of the self-signed certificate template">
                  <span>
                    Name <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                  </span>
                </EuiToolTip>
              ),
              field: 'name',
              textOnly: true,
              sortable: true,
              render: (_, certificate: SelfSignedCertificate) => <EuiText>{certificate.name}</EuiText>,
            },
            {
              name: 'Distinguished name (DN)',
              field: 'commonName',
              render: (_, certificate: SelfSignedCertificate) => (
                <EuiText>{getDistinguishedNameString(certificate)}</EuiText>
              ),
            },
            {
              name: 'Not valid before',
              field: 'notValidBefore',
              sortable: true,
              render: (_, certificate: SelfSignedCertificate) => (
                <EuiText>{moment.unix(certificate.notValidBefore).format('LL HH:mm')}</EuiText>
              ),
            },
            {
              name: 'Not valid after',
              field: 'notValidAfter',
              sortable: true,
              render: (_, certificate: SelfSignedCertificate) => (
                <EuiText>{moment.unix(certificate.notValidAfter).format('LL HH:mm')}</EuiText>
              ),
            },
            {
              name: 'Public key algorithm',
              field: 'publicKeyAlgorithm',
              mobileOptions: { only: true },
              render: (_, certificate: SelfSignedCertificate) => (
                <EuiText>{publicKeyAlgorithmString(certificate)}</EuiText>
              ),
            },
            {
              name: 'Signature algorithm',
              field: 'signatureAlgorithm',
              mobileOptions: { only: true },
              render: (_, certificate: SelfSignedCertificate) => (
                <EuiText>{signatureAlgorithmString(certificate)}</EuiText>
              ),
            },
            {
              name: 'Actions',
              field: 'headers',
              width: '75px',
              actions: [
                {
                  name: 'Generate certificate',
                  description: 'Generate certificate',
                  icon: 'download',
                  type: 'icon',
                  isPrimary: true,
                  onClick: onToggleGenerateModal,
                },
                {
                  name: 'Edit template',
                  description: 'Edit template',
                  icon: 'pencil',
                  type: 'icon',
                  isPrimary: true,
                  onClick: onEditCertificate,
                },
                {
                  name: 'Remove template',
                  description: 'Remove template',
                  icon: 'minusInCircle',
                  type: 'icon',
                  onClick: onRemoveCertificate,
                },
              ],
            },
          ]}
        />
      </>
    );
  }

  return (
    <>
      {content}
      {editFlyout}
      {generateModal}
    </>
  );
}
