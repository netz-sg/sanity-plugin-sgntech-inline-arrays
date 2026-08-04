import type {ComponentType} from 'react'
import type {ItemProps, ObjectItemProps} from 'sanity'

import type {InlineArraysConfig} from '../lib/types'
import {InlineItem} from './InlineItem'

/** Primitive items have no fields to open, so they are handed straight back. */
function isObjectItem(props: ItemProps): props is ObjectItemProps {
  return 'inputProps' in props && props.schemaType.jsonType === 'object'
}

/**
 * Binds the item component to one plugin configuration.
 *
 * Built once when the plugin is created — a component defined inline in the
 * plugin factory would be a new type on every render and remount every item.
 *
 * @public
 */
export function createItemComponent(config: InlineArraysConfig): ComponentType<ItemProps> {
  return function InlineArrayItem(props: ItemProps) {
    if (!isObjectItem(props)) return props.renderDefault(props)
    return <InlineItem {...props} config={config} />
  }
}
