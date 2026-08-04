import {Card, Stack, Text} from '@sanity/ui'
import {Component, type ErrorInfo, type ReactNode} from 'react'

interface Props {
  /** Rendered when the inline attempt throws. */
  fallback: ReactNode
  /** Name shown in the console, to make the source obvious. */
  label?: string
  children: ReactNode
}

interface State {
  error?: Error
}

/**
 * Keeps one broken item from taking the form down with it.
 *
 * This plugin renders through `inputProps`, which Sanity marks `@beta` — a
 * Studio upgrade can change its shape without a breaking-change notice. When
 * that happens the editor gets Sanity's own item back and a line in the
 * console, instead of a white page in the middle of their work.
 *
 * @public
 */
export class ItemBoundary extends Component<Props, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return {error}
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Loud enough to find, quiet enough not to break anything.
    console.warn(
      `[inline-arrays] falling back to the default item${
        this.props.label ? ` for "${this.props.label}"` : ''
      }:`,
      error,
      info.componentStack,
    )
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <Stack gap={2}>
        {this.props.fallback}
        <Card padding={2} radius={2} tone="caution" border>
          <Text size={0}>
            This item could not be opened in place and is using the dialog instead.
          </Text>
        </Card>
      </Stack>
    )
  }
}
