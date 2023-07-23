import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { Criteria, Pagination, PropertySort } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiLink,
  EuiScreenReaderOnly,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import axios from 'axios';

import { WEB_PAGE_RESOURCES_TRACKERS_USER_DATA_NAMESPACE } from './web_page_resources_tracker';
import type { WebPageResourcesTracker, WebPageResourcesTrackers } from './web_page_resources_tracker';
import { WebPageResourcesTrackerDetails } from './web_page_resources_tracker_details';
import { WebScrapingResourcesTrackerEditFlyout } from './web_page_resources_tracker_edit_flyout';
import { PageLoadingState } from '../../../../components';
import { getApiUrl, getUserData } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

type ItemType = WebPageResourcesTracker;
type SerializedItemCollectionType = WebPageResourcesTrackers;

export default function WebScrapingResourcesTrackers() {
  const { uiState, setTitleActions } = useWorkspaceContext();

  const [items, setItems] = useState<ItemType[] | null>(null);
  const updateItems = useCallback((updatedItems: ItemType[]) => {
    setItems(updatedItems);
    setTitleActions(updatedItems.length === 0 ? null : createButton);
  }, []);

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<{ isOpen: false } | { isOpen: true; itemToEdit?: ItemType }>(
    { isOpen: false },
  );
  const onToggleEditFlyout = useCallback(
    (updatedItems?: ItemType[]) => {
      if (updatedItems) {
        updateItems(updatedItems);
      }
      setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
    },
    [updateItems],
  );

  const createButton = (
    <EuiButton
      iconType={'plusInCircle'}
      fill
      title="Track resources for a web page"
      onClick={() => onToggleEditFlyout()}
    >
      Track resources
    </EuiButton>
  );

  const docsButton = (
    <EuiButtonEmpty
      iconType={'documentation'}
      title="Learn how to create and use web resources trackers"
      target={'_blank'}
      href={'/docs/guides/web_scraping/resources'}
    >
      Learn how to
    </EuiButtonEmpty>
  );

  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    getUserData<SerializedItemCollectionType>(WEB_PAGE_RESOURCES_TRACKERS_USER_DATA_NAMESPACE).then(
      (items) => {
        updateItems(items ? Object.values(items) : []);
      },
      (err: Error) => {
        console.error(`Failed to load web resources trackers: ${err?.message ?? err}`);
        updateItems([]);
      },
    );
  }, [uiState, updateItems]);

  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<Record<string, ReactNode>>({});
  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <WebScrapingResourcesTrackerEditFlyout onClose={onToggleEditFlyout} item={isEditFlyoutOpen.itemToEdit} />
  ) : null;

  const onEditItem = useCallback((item: ItemType) => {
    setIsEditFlyoutOpen({ isOpen: true, itemToEdit: item });
  }, []);

  const [itemToRemove, setItemToRemove] = useState<ItemType | null>(null);
  const removeConfirmModal = itemToRemove ? (
    <EuiConfirmModal
      title={`Remove "${itemToRemove.name}"?`}
      onCancel={() => setItemToRemove(null)}
      onConfirm={() => {
        setItemToRemove(null);

        axios
          .post(getApiUrl('/api/utils/action'), {
            action: {
              type: 'webScraping',
              value: { type: 'removeWebPageResourcesTracker', value: { trackerName: itemToRemove?.name } },
            },
          })
          .then(() => getUserData<SerializedItemCollectionType>(WEB_PAGE_RESOURCES_TRACKERS_USER_DATA_NAMESPACE))
          .then(
            (items) => updateItems(items ? Object.values(items) : []),
            (err: Error) => {
              console.error(`Failed to remove web resources tracker: ${err?.message ?? err}`);
            },
          );
      }}
      cancelButtonText="Cancel"
      confirmButtonText="Remove"
      buttonColor="danger"
    >
      The web resources tracker for{' '}
      <b>
        {itemToRemove.url} ({itemToRemove.name})
      </b>{' '}
      will be deactivated, and the tracked resources history will be cleared. Are you sure you want to proceed?
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
    ({ page, sort }: Criteria<ItemType>) => {
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

  const toggleItemDetails = (item: ItemType) => {
    const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMapValues[item.name]) {
      delete itemIdToExpandedRowMapValues[item.name];
    } else {
      itemIdToExpandedRowMapValues[item.name] = <WebPageResourcesTrackerDetails item={item} />;
    }
    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
  };

  if (!uiState.synced || !uiState.user || !items) {
    return <PageLoadingState />;
  }

  let content;
  if (items.length === 0) {
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
            icon={<EuiIcon type={'cut'} size={'xl'} />}
            title={<h2>You don't have any web page resources trackers yet</h2>}
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
            body={
              <div>
                <p>Go ahead and track resources for your web page.</p>
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
      <EuiInMemoryTable
        pagination={pagination}
        allowNeutralSort={false}
        sorting={sorting}
        onTableChange={onTableChange}
        items={items}
        itemId={(item) => item.name}
        isExpandable={true}
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        tableLayout={'auto'}
        columns={[
          {
            name: (
              <EuiToolTip content="Name of the resources tracker">
                <span>
                  Name <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'name',
            sortable: true,
            textOnly: true,
            render: (_, item: ItemType) => item.name,
          },
          {
            name: (
              <EuiToolTip content="URL of the web page for resource tracking">
                <span>
                  URL <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'url',
            sortable: true,
            render: (_, item: ItemType) => (
              <EuiLink href={item.url} target="_blank">
                {item.url}
              </EuiLink>
            ),
          },
          {
            name: 'Actions',
            field: 'headers',
            width: '75px',
            actions: [
              {
                name: 'Edit tracker',
                description: 'Edit tracker',
                icon: 'pencil',
                type: 'icon',
                onClick: onEditItem,
              },
              {
                name: 'Remove tracker',
                description: 'Remove tracker',
                icon: 'minusInCircle',
                type: 'icon',
                onClick: setItemToRemove,
              },
            ],
          },
          {
            align: 'right',
            width: '40px',
            isExpander: true,
            name: (
              <EuiScreenReaderOnly>
                <span>Show resources</span>
              </EuiScreenReaderOnly>
            ),
            render: (item: ItemType) => {
              const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
              return (
                <EuiButtonIcon
                  onClick={() => toggleItemDetails(item)}
                  aria-label={itemIdToExpandedRowMapValues[item.name] ? 'Hide resources' : 'Show resources'}
                  iconType={itemIdToExpandedRowMapValues[item.name] ? 'arrowDown' : 'arrowRight'}
                />
              );
            },
          },
        ]}
      />
    );
  }

  return (
    <>
      {content}
      {editFlyout}
      {removeConfirmModal}
    </>
  );
}
