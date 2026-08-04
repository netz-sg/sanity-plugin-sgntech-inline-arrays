import type {InputProps} from 'sanity'

import {OpenItemProvider} from './OpenItemContext'

/**
 * Wraps an array field so its items can agree on which one is open.
 *
 * Deliberately does nothing else: the rendering stays Sanity's, this only puts
 * a provider around it. Keeping the input override this thin is what stops the
 * plugin from fighting the array UI it sits inside — the place where the
 * archived experiment this plugin follows is known to have broken.
 *
 * @public
 */
export function InlineArrayInput(props: InputProps): React.JSX.Element {
  const rendered = props.renderDefault(props)

  // Only arrays of objects have items to coordinate.
  if (props.schemaType.jsonType !== 'array') return rendered

  return <OpenItemProvider>{rendered}</OpenItemProvider>
}
