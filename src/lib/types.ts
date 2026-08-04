import type {ComponentType} from 'react'
import type {ArraySchemaType, ObjectSchemaType, Path} from 'sanity'

/**
 * How an array field behaves.
 *
 * - `accordion` — items open in place, one at a time. The default.
 * - `open` — every item shows its fields, nothing to click. For short arrays.
 * - `false` — Sanity's own behaviour: items open in a dialog.
 *
 * @public
 */
export type InlineMode = 'accordion' | 'open' | false

/**
 * What an item action is handed when it runs.
 *
 * The helpers exist so nobody has to build patches or invent `_key`s by hand —
 * the two things that go wrong most often when writing array code.
 *
 * @public
 */
export interface ItemActionContext<Value = Record<string, unknown>> {
  /** The item's current value. */
  value: Value
  /** Its position in the array. */
  index: number
  /** Full form path of the item. */
  path: Path
  /** Schema type of the item. */
  schemaType: ObjectSchemaType
  /** Schema type of the array it sits in. */
  parentSchemaType: ArraySchemaType
  /** Id of the document being edited, without the `drafts.` prefix. */
  documentId?: string
  /** Type of the document being edited. */
  documentType?: string
  /** Replaces the item. */
  set: (next: Value) => void
  /** Changes single fields of the item. */
  patch: (fields: Partial<Value>) => void
  /** Inserts a new item after this one. A missing `_key` is generated. */
  insertAfter: (next: Partial<Value>) => void
  /** Inserts a new item before this one. */
  insertBefore: (next: Partial<Value>) => void
  /** Removes the item. */
  remove: () => void
}

/**
 * One entry in an array item's menu.
 *
 * @public
 */
export interface ItemAction<Value = Record<string, unknown>> {
  /** Stable name, used as the React key. Falls back to the label. */
  name?: string
  label: string
  icon?: ComponentType
  tone?: 'default' | 'primary' | 'positive' | 'caution' | 'critical'
  /** `true` disables the entry; a string does the same and says why. */
  disabled?: boolean | string
  /** Asks for confirmation before running. */
  confirm?: string
  onHandle: (context: ItemActionContext<Value>) => void
}

/**
 * What a resolver is told about the item it is deciding for.
 *
 * @public
 */
export interface ItemActionResolverContext {
  value: Record<string, unknown>
  index: number
  path: Path
  schemaType: ObjectSchemaType
  parentSchemaType: ArraySchemaType
  documentId?: string
  documentType?: string
}

/**
 * Decides which actions an item offers.
 *
 * Follows the shape of Sanity's own document actions: the previous list comes
 * in, the list to show goes out.
 *
 * @public
 */
export type ItemActionResolver = (
  previous: ItemAction[],
  context: ItemActionResolverContext,
) => ItemAction[]

/**
 * Configuration for {@link inlineArrays}.
 *
 * @public
 */
export interface InlineArraysConfig {
  /**
   * How deep items open in place. Below this they fall back to a dialog,
   * because the indentation leaves too little room to type in.
   *
   * Defaults to 2.
   */
  maxDepth?: number
  /** Default mode for every array. Defaults to `accordion`. */
  mode?: InlineMode
  /**
   * Types that never open in place, by name — an escape hatch for a whole type
   * rather than field by field.
   */
  exclude?: string[]
  /** Adds entries to the item menu. */
  itemActions?: ItemActionResolver
}

/**
 * The options this plugin reads from a schema field.
 *
 * ```ts
 * defineField({name: 'gallery', type: 'array', options: {inline: false}, of: [...]})
 * ```
 *
 * @public
 */
export interface InlineArrayOptions {
  /** `false` keeps Sanity's dialog, `'open'` shows every item expanded. */
  inline?: InlineMode
}
