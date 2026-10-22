import {ChevronDownIcon} from '@sanity/icons/ChevronDown'
import {ChevronRightIcon} from '@sanity/icons/ChevronRight'
import {DragHandleIcon} from '@sanity/icons/DragHandle'
import {EllipsisVerticalIcon} from '@sanity/icons/EllipsisVertical'
import {ExpandIcon} from '@sanity/icons/Expand'
import {TrashIcon} from '@sanity/icons/Trash'
import {Box, Button, Card, Flex} from '@sanity/ui'
import {Menu, MenuButton, MenuDivider, MenuItem} from '@sanity/ui/menu'
import {useState} from 'react'
import {FieldPresence, type ObjectItemProps, useFormValue} from 'sanity'

import {actionContext, actionDisabledReason, actionKey} from '../lib/actions'
import {decideMode} from '../lib/decide'
import type {InlineArraysConfig, ItemAction} from '../lib/types'
import {ItemBoundary} from './ItemBoundary'
import {canRenderInline, ItemFields} from './ItemFields'
import {useOpenItem} from './OpenItemContext'

/** Reads a string field off an unknown value without asserting its shape. */
function readString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object' || !(key in value)) return undefined
  const found = Reflect.get(value, key)
  return typeof found === 'string' ? found : undefined
}

/**
 * One array item that opens where it sits.
 *
 * Falls back to Sanity's own item whenever it should not or cannot take over —
 * an unsupported type, too deep a nesting, a field that opted out, or a beta
 * API that no longer looks the way it did.
 *
 * @public
 */
export function InlineItem(props: ObjectItemProps & {config: InlineArraysConfig}): React.JSX.Element {
  const {config, ...itemProps} = props
  const {
    value,
    path,
    schemaType,
    parentSchemaType,
    presence,
    readOnly,
    inputProps,
    renderDefault,
    onRemove,
    onOpen,
  } = itemProps

  const documentId = readString(useFormValue([]), '_id')?.replace(/^drafts\./, '')
  const documentType = readString(useFormValue([]), '_type')

  const shared = useOpenItem()
  const [localOpen, setLocalOpen] = useState(false)
  const itemKey = value._key

  const mode = decideMode({
    config,
    parentOptions: parentSchemaType.options,
    schemaType,
    path,
  })

  // Without a provider above, each item keeps its own state — several may then
  // be open at once, which is worse than intended but never broken.
  const expanded = mode === 'open' || (shared ? shared.openKey === itemKey : localOpen)

  const toggle = () => {
    if (shared) shared.toggle(itemKey)
    else setLocalOpen((current) => !current)
  }

  const actions: ItemAction[] = config.itemActions
    ? config.itemActions([], {
        value,
        index: itemProps.index,
        path,
        schemaType,
        parentSchemaType,
        documentId,
        documentType,
      })
    : []

  const runAction = (action: ItemAction) => {
    if (action.confirm && !globalThis.confirm(action.confirm)) return
    action.onHandle(actionContext({props: itemProps, documentId, documentType}))
  }

  const fallback = renderDefault(itemProps)

  if (mode === false || !canRenderInline(inputProps)) {
    // Actions still belong on the item even when it opens in a dialog, so they
    // are not silently lost for excluded fields.
    return fallback
  }

  const menu = (
    <MenuButton
      id={`inline-array-item-menu-${itemKey}`}
      button={
        <Button
          icon={EllipsisVerticalIcon}
          mode="bleed"
          padding={2}
          fontSize={1}
          title="Item options"
          aria-label="Item options"
        />
      }
      menu={
        <Menu>
          <MenuItem
            text="Open in dialog"
            icon={ExpandIcon}
            onClick={onOpen}
            disabled={readOnly}
          />
          {actions.length > 0 && <MenuDivider />}
          {actions.map((action, index) => {
            const reason = actionDisabledReason(action)
            return (
              <MenuItem
                key={actionKey(action, index)}
                text={action.label}
                icon={action.icon}
                tone={action.tone}
                title={reason}
                disabled={readOnly || Boolean(reason)}
                onClick={() => runAction(action)}
              />
            )
          })}
          <MenuDivider />
          <MenuItem
            text="Remove"
            icon={TrashIcon}
            tone="critical"
            disabled={readOnly}
            onClick={onRemove}
          />
        </Menu>
      }
    />
  )

  return (
    <Card radius={2} border tone={expanded ? 'transparent' : 'default'}>
      <Flex align="center" gap={1} paddingX={1}>
        <Box paddingX={1} style={{cursor: 'grab', opacity: 0.5}}>
          <DragHandleIcon />
        </Box>

        {mode === 'accordion' && (
          <Button
            icon={expanded ? ChevronDownIcon : ChevronRightIcon}
            mode="bleed"
            padding={2}
            fontSize={1}
            onClick={toggle}
            title={expanded ? 'Collapse' : 'Expand'}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            aria-expanded={expanded}
          />
        )}

        <Box
          flex={1}
          paddingY={1}
          style={{minWidth: 0, cursor: mode === 'accordion' ? 'pointer' : 'default'}}
          onClick={mode === 'accordion' ? toggle : undefined}
        >
          {inputProps.renderPreview({schemaType, value, layout: 'default'})}
        </Box>

        {/* Presence on the closed row: otherwise a colleague working inside a
            collapsed item would be invisible, which the dialog never was. */}
        {!expanded && presence.length > 0 && (
          <Box paddingX={1}>
            <FieldPresence presence={presence} maxAvatars={3} />
          </Box>
        )}

        {menu}
      </Flex>

      {expanded && (
        <Box padding={3} paddingTop={0}>
          <ItemBoundary fallback={fallback} label={schemaType.name}>
            <ItemFields inputProps={inputProps} />
          </ItemBoundary>
        </Box>
      )}
    </Card>
  )
}
