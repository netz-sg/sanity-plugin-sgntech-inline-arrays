import {type ObjectItem, type ObjectItemProps, set, unset} from 'sanity'

import type {ItemAction, ItemActionContext} from './types'

/** A `_key` that is unique enough for an array item and readable in the data. */
export function newKey(): string {
  const random = Math.random().toString(36).slice(2, 10)
  return `${random}${Date.now().toString(36)}`
}

/**
 * Gives a new item the two fields Sanity insists on, without overwriting what
 * the caller set deliberately.
 *
 * @public
 */
export function withItemMeta(next: Record<string, unknown>, typeName: string): ObjectItem {
  return {
    _type: typeof next._type === 'string' ? next._type : typeName,
    ...next,
    _key: typeof next._key === 'string' ? next._key : newKey(),
  }
}

/**
 * Turns a flat set of field values into patches, treating `undefined` as
 * "remove this field" rather than writing an empty value.
 *
 * @public
 */
export function fieldPatches(fields: Record<string, unknown>) {
  return Object.entries(fields).map(([field, value]) =>
    value === undefined ? unset([field]) : set(value, [field]),
  )
}

/**
 * Builds the helpers an action is handed.
 *
 * The point of every one of these is that the caller never has to think about
 * `_key`s or path arithmetic — the two things that quietly corrupt array data
 * when written by hand.
 *
 * @public
 */
export function actionContext(input: {
  props: ObjectItemProps
  documentId?: string
  documentType?: string
}): ItemActionContext {
  const {props, documentId, documentType} = input
  const {value, index, path, schemaType, parentSchemaType, inputProps} = props

  const insert = (next: Record<string, unknown>, position: 'before' | 'after') =>
    // `onInsert` is the array's own insert and already knows which item it was
    // called from, so the new sibling lands next to this one.
    props.onInsert({position, items: [withItemMeta(next, schemaType.name)]})

  return {
    value,
    index,
    path,
    schemaType,
    parentSchemaType,
    documentId,
    documentType,

    // Patches go through the item's own input, so they land on this item and
    // stay undoable in the document history.
    set: (next) => {
      // The key is kept whatever the caller passes: changing it would make the
      // item look new to Sanity and lose its place in the history.
      inputProps.onChange(set(withItemMeta({...next, _key: value._key}, schemaType.name)))
    },

    patch: (fields) => inputProps.onChange(fieldPatches(fields)),

    insertAfter: (next) => insert(next, 'after'),
    insertBefore: (next) => insert(next, 'before'),
    remove: () => props.onRemove(),
  }
}

/**
 * Whether an action can be run, and why not when it cannot.
 *
 * @public
 */
export function actionDisabledReason(action: ItemAction): string | undefined {
  if (action.disabled === true) return 'Not available here'
  if (typeof action.disabled === 'string') return action.disabled
  return undefined
}

/**
 * A stable key for an action, so React does not remount the menu on every
 * render when actions come from a resolver.
 *
 * @public
 */
export function actionKey(action: ItemAction, index: number): string {
  return action.name ?? `${action.label}-${index}`
}
