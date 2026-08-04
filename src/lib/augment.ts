import type {InlineMode} from './types'

/**
 * Teaches `defineField` about `options.inline`, so opting a field out is
 * ordinary typed schema code instead of a cast.
 *
 * ```ts
 * defineField({name: 'gallery', type: 'array', options: {inline: false}, of: [...]})
 * ```
 */
declare module 'sanity' {
  interface ArrayOptions {
    /**
     * How this array's items open.
     *
     * - `false` keeps Sanity's dialog
     * - `'open'` shows every item expanded
     * - `'accordion'` (the default) opens one item at a time in place
     * - `true` is read as `'accordion'`
     */
    inline?: InlineMode | true
  }
}
