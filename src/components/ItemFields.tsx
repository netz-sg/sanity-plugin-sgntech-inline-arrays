import {Stack, Text} from '@sanity/ui'
import {ObjectInputMember, type ObjectItemProps} from 'sanity'

/** What we need from `inputProps` to render an item's fields ourselves. */
type Renderable = ObjectItemProps['inputProps']

/**
 * True when the beta shape we depend on is actually there.
 *
 * Checked rather than assumed: `inputProps` is marked `@beta @hidden`, so a
 * Studio upgrade may change it. When the check fails the caller shows Sanity's
 * own item instead — the plugin stops working, nothing breaks.
 *
 * @public
 */
export function canRenderInline(inputProps: unknown): inputProps is Renderable {
  if (!inputProps || typeof inputProps !== 'object') return false
  const props = inputProps as Partial<Renderable>

  return (
    Array.isArray(props.members) &&
    typeof props.renderField === 'function' &&
    typeof props.renderInput === 'function' &&
    typeof props.renderItem === 'function' &&
    typeof props.renderPreview === 'function'
  )
}

/**
 * The fields of one array item, rendered where the item sits.
 *
 * @public
 */
export function ItemFields(props: {inputProps: Renderable}): React.JSX.Element {
  const {inputProps} = props

  if (inputProps.members.length === 0) {
    return (
      <Text size={1} muted>
        This item has no fields to edit.
      </Text>
    )
  }

  return (
    <Stack gap={4}>
      {inputProps.members.map((member) => (
        <ObjectInputMember
          key={member.key}
          member={member}
          renderAnnotation={inputProps.renderAnnotation}
          renderBlock={inputProps.renderBlock}
          renderField={inputProps.renderField}
          renderInlineBlock={inputProps.renderInlineBlock}
          renderInput={inputProps.renderInput}
          renderItem={inputProps.renderItem}
          renderPreview={inputProps.renderPreview}
        />
      ))}
    </Stack>
  )
}
