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
import {
  CERTIFICATE_TEMPLATES_USER_DATA_NAMESPACE,
  certificateTypeString,
  deserializeCertificateTemplates,
  getDistinguishedNameString,
  signatureAlgorithmString,
} from './certificate_template';
import type { CertificateTemplate, SerializedCertificateTemplates } from './certificate_template';
import { SELF_SIGNED_PROD_WARNING_USER_SETTINGS_KEY } from './consts';
import { privateKeyAlgString } from './private_key_alg';
import { SaveCertificateTemplateFlyout } from './save_certificate_template_flyout';
import { PageLoadingState } from '../../../../components';
import { getUserData, setUserData } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

export default function CertificatesCertificateTemplates() {
  const { uiState, settings, setSettings, setTitleActions } = useWorkspaceContext();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<
    { isOpen: false } | { isOpen: true; template: CertificateTemplate }
  >({ isOpen: false });
  const onToggleGenerateModal = useCallback((template?: CertificateTemplate) => {
    if (template) {
      setIsGenerateModalOpen({ isOpen: true, template });
    } else {
      setIsGenerateModalOpen({ isOpen: false });
    }
  }, []);

  const [templates, setTemplates] = useState<CertificateTemplate[] | null>(null);
  const updateTemplates = useCallback((updatedTemplates: CertificateTemplate[]) => {
    setTemplates(updatedTemplates);
    setTitleActions(updatedTemplates.length === 0 ? null : createButton);
  }, []);

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<
    { isOpen: false } | { isOpen: true; template?: CertificateTemplate }
  >({ isOpen: false });
  const onToggleEditFlyout = useCallback(
    (updatedTemplates?: CertificateTemplate[]) => {
      if (updatedTemplates) {
        updateTemplates(updatedTemplates);
      }
      setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
    },
    [updateTemplates],
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

    getUserData<SerializedCertificateTemplates>(CERTIFICATE_TEMPLATES_USER_DATA_NAMESPACE).then(
      (serializedTemplates) => updateTemplates(deserializeCertificateTemplates(serializedTemplates)),
      (err: Error) => {
        console.error(`Failed to load certificate templates: ${err?.message ?? err}`);
        updateTemplates([]);
      },
    );
  }, [uiState, updateTemplates]);

  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <SaveCertificateTemplateFlyout onClose={onToggleEditFlyout} template={isEditFlyoutOpen.template} />
  ) : null;

  const generateModal = isGenerateModalOpen.isOpen ? (
    <CertificateFormatModal onClose={() => onToggleGenerateModal()} template={isGenerateModalOpen.template} />
  ) : null;

  const [templateToRemove, setTemplateToRemove] = useState<CertificateTemplate | null>(null);
  const removeConfirmModal = templateToRemove ? (
    <EuiConfirmModal
      title={`Remove "${templateToRemove.name}"?`}
      onCancel={() => setTemplateToRemove(null)}
      onConfirm={() => {
        setTemplateToRemove(null);
        setUserData<SerializedCertificateTemplates>(CERTIFICATE_TEMPLATES_USER_DATA_NAMESPACE, {
          [templateToRemove.name]: null,
        }).then(
          (serializedCertificates) => updateTemplates(deserializeCertificateTemplates(serializedCertificates)),
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

  const onEditTemplate = useCallback((template: CertificateTemplate) => {
    setIsEditFlyoutOpen({ isOpen: true, template });
  }, []);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const [sorting, setSorting] = useState<{ sort: PropertySort }>({ sort: { field: 'name', direction: 'asc' } });
  const onTableChange = useCallback(
    ({ page, sort }: Criteria<CertificateTemplate>) => {
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

  if (!uiState.synced || !uiState.user || !templates) {
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
  if (templates.length === 0) {
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
                <p>Go ahead and create your first certificate template.</p>
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
          items={templates}
          itemId={(template) => template.name}
          tableLayout={'auto'}
          columns={[
            {
              name: (
                <EuiToolTip content="A unique name of the certificate template">
                  <span>
                    Name <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                  </span>
                </EuiToolTip>
              ),
              field: 'name',
              textOnly: true,
              sortable: true,
              render: (_, template) => <EuiText>{template.name}</EuiText>,
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
              render: (_, template) => <EuiText>{certificateTypeString(template)}</EuiText>,
            },
            {
              name: 'Distinguished name (DN)',
              field: 'commonName',
              render: (_, template) => <EuiText>{getDistinguishedNameString(template)}</EuiText>,
            },
            {
              name: 'Not valid before',
              field: 'notValidBefore',
              sortable: true,
              render: (_, template) => <EuiText>{unix(template.notValidBefore).format('LL HH:mm')}</EuiText>,
            },
            {
              name: 'Not valid after',
              field: 'notValidAfter',
              sortable: true,
              render: (_, template) => <EuiText>{unix(template.notValidAfter).format('LL HH:mm')}</EuiText>,
            },
            {
              name: 'Key algorithm',
              field: 'keyAlgorithm',
              mobileOptions: { only: true },
              render: (_, template) => <EuiText>{privateKeyAlgString(template.keyAlgorithm)}</EuiText>,
            },
            {
              name: 'Signature algorithm',
              field: 'signatureAlgorithm',
              mobileOptions: { only: true },
              render: (_, template) => <EuiText>{signatureAlgorithmString(template)}</EuiText>,
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
                  onClick: onEditTemplate,
                },
                {
                  name: 'Remove template',
                  description: 'Remove template',
                  icon: 'minusInCircle',
                  type: 'icon',
                  onClick: setTemplateToRemove,
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
