import { useCallback, useEffect, useState } from 'react';

import type { Criteria, Pagination, PropertySort } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { unix } from 'moment';

import { CertificateFormatModal } from './certificate_format_modal';
import { SELF_SIGNED_PROD_WARNING_USER_SETTINGS_KEY } from './consts';
import { SaveSelfSignedCertificatesFlyout } from './save_self_signed_certificate_flyout';
import {
  certificateTypeString,
  deserializeSelfSignedCertificates,
  getDistinguishedNameString,
  keyAlgorithmString,
  SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE,
  signatureAlgorithmString,
} from './self_signed_certificate';
import type { SelfSignedCertificate, SerializedSelfSignedCertificates } from './self_signed_certificate';
import { PageLoadingState } from '../../../../components';
import { getUserData, setUserData } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

export default function CertificatesSelfSignedCertificates() {
  const { uiState, settings, setSettings, setTitleActions } = useWorkspaceContext();

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

  const [certificates, setCertificates] = useState<SelfSignedCertificate[] | null>(null);
  const updateCertificates = useCallback((updatedCertificates: SelfSignedCertificate[]) => {
    setCertificates(updatedCertificates);
    setTitleActions(updatedCertificates.length === 0 ? null : createButton);
  }, []);

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<
    { isOpen: false } | { isOpen: true; certificate?: SelfSignedCertificate }
  >({ isOpen: false });
  const onToggleEditFlyout = useCallback(
    (updatedCertificates?: SelfSignedCertificate[]) => {
      if (updatedCertificates) {
        updateCertificates(updatedCertificates);
      }
      setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
    },
    [updateCertificates],
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

  const docsButton = (
    <EuiButtonEmpty
      iconType={'documentation'}
      title="Learn how to create and use certificate templates"
      target={'_blank'}
      href={'/docs/guides/digital_certificates'}
    >
      Learn how to
    </EuiButtonEmpty>
  );

  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    getUserData<SerializedSelfSignedCertificates>(SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE).then(
      (serializedCertificates) => updateCertificates(deserializeSelfSignedCertificates(serializedCertificates)),
      (err: Error) => {
        console.error(`Failed to load certificate templates: ${err?.message ?? err}`);
        updateCertificates([]);
      },
    );
  }, [uiState, updateCertificates]);

  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <SaveSelfSignedCertificatesFlyout onClose={onToggleEditFlyout} certificate={isEditFlyoutOpen.certificate} />
  ) : null;

  const generateModal = isGenerateModalOpen.isOpen ? (
    <CertificateFormatModal onClose={() => onToggleGenerateModal()} certificate={isGenerateModalOpen.certificate} />
  ) : null;

  const [certificateToRemove, setCertificateToRemove] = useState<SelfSignedCertificate | null>(null);
  const removeConfirmModal = certificateToRemove ? (
    <EuiConfirmModal
      title={`Remove "${certificateToRemove.name}"?`}
      onCancel={() => setCertificateToRemove(null)}
      onConfirm={() => {
        setCertificateToRemove(null);
        setUserData<SerializedSelfSignedCertificates>(SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE, {
          [certificateToRemove.name]: null,
        }).then(
          (serializedCertificates) => updateCertificates(deserializeSelfSignedCertificates(serializedCertificates)),
          (err: Error) => {
            console.error(`Failed to remove certificate template: ${err?.message ?? err}`);
          },
        );
      }}
      cancelButtonText="Cancel"
      confirmButtonText="Remove"
      buttonColor="danger"
    >
      The certificate template will be removed. Are you sure you want to proceed?
    </EuiConfirmModal>
  ) : null;

  const onEditCertificate = useCallback((certificate: SelfSignedCertificate) => {
    setIsEditFlyoutOpen({ isOpen: true, certificate: certificate });
  }, []);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const [sorting, setSorting] = useState<{ sort: PropertySort }>({ sort: { field: 'name', direction: 'asc' } });
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

  const selfSignedCertificatesProdWarning =
    settings?.[SELF_SIGNED_PROD_WARNING_USER_SETTINGS_KEY] === true ? null : (
      <div>
        <EuiCallOut
          title="Don't use self-signed certificates in production environments"
          color="warning"
          iconType="warning"
        >
          <p>
            Self-signed certificates generated through Secutils.dev are intended for use in development and testing
            environments only. Please do not use these certificates in production environments unless you are running{' '}
            <EuiLink target="_blank" href="https://github.com/secutils-dev/secutils">
              your own version
            </EuiLink>{' '}
            of the Secutils.dev in a trusted and controlled environment.
          </p>
          <EuiButton color="accent" onClick={() => setSettings({ [SELF_SIGNED_PROD_WARNING_USER_SETTINGS_KEY]: true })}>
            Do not show again
          </EuiButton>
        </EuiCallOut>{' '}
        <EuiSpacer />
      </div>
    );

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
                <EuiSpacer size={'s'} />
                {docsButton}
              </div>
            }
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  } else {
    content = (
      <>
        {selfSignedCertificatesProdWarning}
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
              name: (
                <EuiToolTip content="Specifies whether the certificate can be used to sign other certificates (Certification Authority) or not.">
                  <span>
                    Type <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                  </span>
                </EuiToolTip>
              ),
              field: 'isCA',
              textOnly: true,
              sortable: true,
              render: (_, certificate: SelfSignedCertificate) => (
                <EuiText>{certificateTypeString(certificate)}</EuiText>
              ),
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
                <EuiText>{unix(certificate.notValidBefore).format('LL HH:mm')}</EuiText>
              ),
            },
            {
              name: 'Not valid after',
              field: 'notValidAfter',
              sortable: true,
              render: (_, certificate: SelfSignedCertificate) => (
                <EuiText>{unix(certificate.notValidAfter).format('LL HH:mm')}</EuiText>
              ),
            },
            {
              name: 'Public key algorithm',
              field: 'publicKeyAlgorithm',
              mobileOptions: { only: true },
              render: (_, certificate: SelfSignedCertificate) => <EuiText>{keyAlgorithmString(certificate)}</EuiText>,
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
                  name: 'Generate',
                  description: 'Generate',
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
                  onClick: setCertificateToRemove,
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
      {removeConfirmModal}
    </>
  );
}
