import type {InlineArraysConfig, InlineMode} from './types'

/** What the plugin falls back to when nothing says otherwise. */
export const DEFAULTS = {maxDepth: 2, mode: 'accordion' as InlineMode}

/**
 * Types Sanity already edits in place, or that bring their own interface worth
 * keeping. Rendering our own fields over these would take something away.
 *
 * @public
 */
export const PASSTHROUGH_TYPES = ['reference', 'crossDatasetReference', 'geopoint', 'slug', 'file']

/** Every type name in a schema type's inheritance chain. */
function typeChain(schemaType: unknown): string[] {
  const names: string[] = []
  let current = schemaType

  while (current && typeof current === 'object') {
    const record = current as {name?: unknown; type?: unknown; jsonType?: unknown}
    if (typeof record.name === 'string') names.push(record.name)
    if (typeof record.jsonType === 'string') names.push(record.jsonType)
    current = record.type
  }

  return names
}

/**
 * Whether this kind of item is one we touch at all.
 *
 * Objects and images open in place; everything else is handed straight to
 * Sanity — a reference is already a search field, a primitive is already
 * inline, and an image's crop tool needs a dialog's room.
 *
 * @public
 */
export function isSupportedItem(schemaType: unknown, exclude: string[] = []): boolean {
  const chain = typeChain(schemaType)
  if (chain.length === 0) return false
  if (chain.some((name) => exclude.includes(name))) return false
  if (chain.some((name) => PASSTHROUGH_TYPES.includes(name))) return false

  // `image` is an object underneath, so the object check catches both.
  return chain.includes('object') || chain.includes('image')
}

/**
 * How deeply an item is nested, counted in arrays above it.
 *
 * A path like `['gallery', {_key: 'a'}, 'items', {_key: 'b'}]` is depth 2: the
 * key segments are the array items.
 *
 * @public
 */
export function itemDepth(path: readonly unknown[] | undefined): number {
  if (!Array.isArray(path)) return 0
  return path.filter((segment) => typeof segment === 'object' && segment !== null && '_key' in segment)
    .length
}

/**
 * Reads the mode a field asks for, ignoring anything that is not a mode.
 *
 * @public
 */
export function modeFromOptions(options: unknown): InlineMode | undefined {
  if (!options || typeof options !== 'object') return undefined
  const value = (options as {inline?: unknown}).inline

  if (value === false) return false
  if (value === 'open' || value === 'accordion') return value
  // `inline: true` is the obvious thing to write, so it is accepted.
  if (value === true) return 'accordion'
  return undefined
}

/**
 * Decides how one item is rendered.
 *
 * Order of precedence: the field's own `options.inline`, then the plugin
 * default — and past `maxDepth` the answer is always the dialog, because the
 * indentation has eaten the room by then.
 *
 * @public
 */
export function decideMode(input: {
  config: InlineArraysConfig
  /** `options` of the array field the item sits in. */
  parentOptions?: unknown
  schemaType: unknown
  path: readonly unknown[] | undefined
}): InlineMode {
  const {config, parentOptions, schemaType, path} = input

  const asked = modeFromOptions(parentOptions)
  if (asked === false) return false

  if (!isSupportedItem(schemaType, config.exclude ?? [])) return false

  const maxDepth = config.maxDepth ?? DEFAULTS.maxDepth
  if (itemDepth(path) > maxDepth) return false

  return asked ?? config.mode ?? DEFAULTS.mode
}
