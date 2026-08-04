import {definePlugin} from 'sanity'

// Loaded for its declaration only: adds `options.inline` to Sanity's array
// options, so opting a field out type-checks without a cast.
// oxlint-disable-next-line no-unassigned-import
import './lib/augment'

import {InlineArrayInput} from './components/InlineArrayInput'
import {createItemComponent} from './components/itemComponent'
import type {InlineArraysConfig} from './lib/types'

/**
 * Edit array items where they sit instead of in a dialog.
 *
 * Sanity opens every array item in a modal, and an object inside an array
 * inside an object means a modal inside a modal. The request to change that
 * ({@link https://github.com/sanity-io/sanity/issues/921 | #921}) collected 38
 * votes over seven years and was closed as not planned — so a plugin is the
 * only way it happens.
 *
 * Applies to every array in the Studio. A field opts out with
 * `options: {inline: false}`, a whole type with `exclude`.
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {inlineArrays} from 'sanity-plugin-sgntech-inline-arrays'
 *
 * export default defineConfig({
 *   plugins: [inlineArrays({maxDepth: 2})],
 * })
 * ```
 *
 * Items open one at a time. Objects and images are handled; references,
 * primitives, files and geopoints keep Sanity's own interface, because they
 * either edit in place already or need a dialog's room.
 *
 * The inline rendering leans on `inputProps`, which Sanity marks as beta. Every
 * item checks that the shape is still there and falls back to Sanity's own item
 * when it is not, so a Studio upgrade can make this plugin ineffective but not
 * broken.
 *
 * @public
 */
export const inlineArrays = definePlugin<InlineArraysConfig | void>((config) => {
  const options = config || {}

  return {
    name: 'sanity-plugin-sgntech-inline-arrays',

    form: {
      components: {
        // The input override only installs the shared open-item state; the
        // item override does the actual work.
        input: InlineArrayInput,

        item: createItemComponent(options),
      },
    },
  }
})

export {InlineArrayInput} from './components/InlineArrayInput'
export {createItemComponent} from './components/itemComponent'
export {InlineItem} from './components/InlineItem'
export {ItemBoundary} from './components/ItemBoundary'
export {canRenderInline, ItemFields} from './components/ItemFields'
export {OpenItemProvider, useOpenItem} from './components/OpenItemContext'
export {
  actionContext,
  actionDisabledReason,
  actionKey,
  fieldPatches,
  newKey,
  withItemMeta,
} from './lib/actions'
export {
  decideMode,
  DEFAULTS,
  isSupportedItem,
  itemDepth,
  modeFromOptions,
  PASSTHROUGH_TYPES,
} from './lib/decide'
export type {
  InlineArrayOptions,
  InlineArraysConfig,
  InlineMode,
  ItemAction,
  ItemActionContext,
  ItemActionResolver,
  ItemActionResolverContext,
} from './lib/types'
