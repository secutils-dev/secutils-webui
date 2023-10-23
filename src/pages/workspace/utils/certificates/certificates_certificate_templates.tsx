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
import axios from 'axios';
import { unix } from 'moment';

import { certificateTypeString, getDistinguishedNameString, signatureAlgorithmString } from './certificate_attributes';
import { CertificateFormatModal } from './certificate_format_modal';
import type { CertificateTemplate } from './certificate_template';
import { SELF_SIGNED_PROD_WARNING_USER_SETTINGS_KEY } from './consts';
import { privateKeyAlgString } from './private_key_alg';
import { SaveCertificateTemplateFlyout } from './save_certificate_template_flyout';
import { PageErrorState, PageLoadingState } from '../../../../components';
import { type AsyncData, getApiRequestConfig, getApiUrl, getErrorMessage } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

type GetCertificateTemplatesResponse = {
  value: { value: CertificateTemplate[] };
};

export default function CertificatesCertificateTemplates() {
  const { uiState, settings, setSettings, setTitleActions } = useWorkspaceContext();

  const [templates, setTemplates] = useState<AsyncData<CertificateTemplate[]>>({ status: 'pending' });

  const [templateToGenerate, setTemplateToGenerate] = useState<CertificateTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<CertificateTemplate | null | undefined>(null);
  const [templateToRemove, setTemplateToRemove] = useState<CertificateTemplate | null>(null);

  const loadCertificateTemplates = () => {
    axios
      .post<GetCertificateTemplatesResponse>(
        getApiUrl('/api/utils/action'),
        { action: { type: 'certificates', value: { type: 'getCertificateTemplates' } } },
        getApiRequestConfig(),
      )
      .then(
        (response) => {
          const templatesData = response.data.value.value;
          setTemplates({ status: 'succeeded', data: templatesData });
          setTitleActions(templatesData.length === 0 ? null : createButton);
        },
        (err: Error) => {
          setTemplates({ status: 'failed', error: getErrorMessage(err) });
        },
      );
  };

  useEffect(() => {
    if (!uiState.synced) {
      return;
    }

    loadCertificateTemplates();
  }, [uiState]);

  const createButton = (
    <EuiButton
      iconType={'plusInCircle'}
      title="Create a new certificate template"
      fill
      onClick={() => setTemplateToEdit(undefined)}
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

  const editFlyout =
    templateToEdit !== null ? (
      <SaveCertificateTemplateFlyout
        onClose={(success) => {
          if (success) {
            loadCertificateTemplates();
          }
          setTemplateToEdit(null);
        }}
        template={templateToEdit}
      />
    ) : null;

  const generateModal = templateToGenerate ? (
    <CertificateFormatModal onClose={() => setTemplateToGenerate(null)} template={templateToGenerate} />
  ) : null;

  const removeConfirmModal = templateToRemove ? (
    <EuiConfirmModal
      title={`Remove "${templateToRemove.name}"?`}
      onCancel={() => setTemplateToRemove(null)}
      onConfirm={() => {
        setTemplateToRemove(null);
        axios
          .post(getApiUrl('/api/utils/action'), {
            action: {
              type: 'certificates',
              value: { type: 'removeCertificateTemplate', value: { templateId: templateToRemove?.id } },
            },
          })
          .then(
            () => loadCertificateTemplates(),
            (err: Error) => {
              console.error(`Failed to remove certificate template: ${getErrorMessage(err)}`);
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

  if (templates.status === 'pending') {
    return <PageLoadingState />;
  }

  if (templates.status === 'failed') {
    return (
      <PageErrorState
        title="Cannot load certificate templates"
        content={
          <p>
            Cannot load certificate templates.
            <br />
            <br />
            <strong>{templates.error}</strong>.
          </p>
        }
      />
    );
  }

  let content;
  if (templates.data.length === 0) {
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
            <EuiButton
              color="accent"
              onClick={() => setSettings({ [SELF_SIGNED_PROD_WARNING_USER_SETTINGS_KEY]: true })}
            >
              Do not show again
            </EuiButton>
          </EuiCallOut>{' '}
          <EuiSpacer />
        </div>
      );

    content = (
      <>
        {selfSignedCertificatesProdWarning}
        <EuiInMemoryTable
          pagination={pagination}
          allowNeutralSort={false}
          sorting={sorting}
          onTableChange={onTableChange}
          items={templates.data}
          itemId={(template) => template.id}
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
              field: 'isCa',
              textOnly: true,
              sortable: true,
              render: (_, template) => <EuiText>{certificateTypeString(template.attributes)}</EuiText>,
            },
            {
              name: 'Distinguished name (DN)',
              field: 'commonName',
              render: (_, template) => <EuiText>{getDistinguishedNameString(template.attributes)}</EuiText>,
            },
            {
              name: 'Not valid before',
              field: 'notValidBefore',
              sortable: true,
              render: (_, template) => <EuiText>{unix(template.attributes.notValidBefore).format('LL HH:mm')}</EuiText>,
            },
            {
              name: 'Not valid after',
              field: 'notValidAfter',
              sortable: true,
              render: (_, template) => <EuiText>{unix(template.attributes.notValidAfter).format('LL HH:mm')}</EuiText>,
            },
            {
              name: 'Key algorithm',
              field: 'keyAlgorithm',
              mobileOptions: { only: true },
              render: (_, template) => <EuiText>{privateKeyAlgString(template.attributes.keyAlgorithm)}</EuiText>,
            },
            {
              name: 'Signature algorithm',
              field: 'signatureAlgorithm',
              mobileOptions: { only: true },
              render: (_, template) => <EuiText>{signatureAlgorithmString(template.attributes)}</EuiText>,
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
                  onClick: setTemplateToGenerate,
                },
                {
                  name: 'Edit template',
                  description: 'Edit template',
                  icon: 'pencil',
                  type: 'icon',
                  isPrimary: true,
                  onClick: setTemplateToEdit,
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