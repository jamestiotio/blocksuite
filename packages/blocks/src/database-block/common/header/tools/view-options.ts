import type { ReferenceElement } from '@floating-ui/dom';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { eventToVRect, popMenu } from '../../../../components/menu/menu.js';
import {
  ArrowRightSmallIcon,
  DeleteIcon,
  DuplicateIcon,
  FilterIcon,
  GroupingIcon,
  InfoIcon,
  MoreHorizontalIcon,
} from '../../../../icons/index.js';
import type { DataViewKanbanManager } from '../../../kanban/kanban-view-manager.js';
import type { DataViewTableManager } from '../../../table/table-view-manager.js';
import { popFilterModal } from '../../filter/filter-modal.js';
import {
  popGroupSetting,
  popSelectGroupByProperty,
} from '../../group-by/setting.js';
import { popPropertiesSetting } from '../../properties.js';
import { BaseTool } from './base-tool.js';

const styles = css`
  .affine-database-toolbar-item.more-action {
    padding: 2px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .affine-database-toolbar-item.more-action:hover {
    background: var(--affine-hover-color);
  }

  .affine-database-toolbar-item.more-action svg {
    width: 20px;
    height: 20px;
    fill: var(--affine-icon-color);
  }

  .more-action.active {
    background: var(--affine-hover-color);
  }
`;

@customElement('data-view-header-tools-view-options')
export class DataViewHeaderToolsViewOptions extends BaseTool<
  DataViewKanbanManager | DataViewTableManager
> {
  static override styles = styles;

  showToolBar(show: boolean) {
    const tools = this.closest('data-view-header-tools');
    if (tools) {
      tools.showToolBar = show;
    }
  }

  private _clickMoreAction = (e: MouseEvent) => {
    e.stopPropagation();
    this.showToolBar(true);
    const target = eventToVRect(e);
    popViewOptions(target, this.view, () => {
      this.showToolBar(false);
    });
  };

  override render() {
    if (this.view.readonly) {
      return;
    }
    return html` <div
      class="affine-database-toolbar-item more-action dv-icon-20"
      @click="${this._clickMoreAction}"
    >
      ${MoreHorizontalIcon}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'data-view-header-tools-view-options': DataViewHeaderToolsViewOptions;
  }
}
export const popViewOptions = (
  target: ReferenceElement,
  view: DataViewTableManager | DataViewKanbanManager,
  onClose?: () => void
) => {
  const reopen = () => {
    popViewOptions(target, view);
  };
  popMenu(target, {
    options: {
      style: 'min-width:300px',
      input: {
        initValue: view.name,
        onComplete: text => {
          view.updateName(text);
        },
      },
      items: [
        {
          type: 'action',
          name: 'Properties',
          icon: InfoIcon,
          postfix: ArrowRightSmallIcon,
          select: () => {
            requestAnimationFrame(() => {
              popPropertiesSetting(target, {
                view: view,
                onBack: reopen,
              });
            });
          },
        },
        {
          type: 'action',
          name: 'Filter',
          icon: FilterIcon,
          postfix: ArrowRightSmallIcon,
          select: () => {
            popFilterModal(target, {
              vars: view.vars,
              value: view.filter,
              onChange: view.updateFilter.bind(view),
              isRoot: true,
              onBack: reopen,
              onDelete: () => {
                view.updateFilter({
                  ...view.filter,
                  conditions: [],
                });
              },
            });
          },
        },
        {
          type: 'action',
          name: 'Group',
          icon: GroupingIcon,
          postfix: ArrowRightSmallIcon,
          select: () => {
            const groupBy = view.view.groupBy;
            if (!groupBy) {
              popSelectGroupByProperty(target, view);
            } else {
              popGroupSetting(target, view, reopen);
            }
          },
        },
        {
          type: 'action',
          name: 'Duplicate',
          icon: DuplicateIcon,
          select: () => {
            view.duplicateView();
          },
        },
        {
          type: 'group',
          name: '',
          children: () => [
            {
              type: 'action',
              name: 'Delete View',
              icon: DeleteIcon,
              select: () => {
                view.deleteView();
              },
              class: 'delete-item',
            },
          ],
        },
      ],
      onClose: onClose,
    },
  });
};
