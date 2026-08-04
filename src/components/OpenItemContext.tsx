import {createContext, useContext, useMemo, useState} from 'react'

interface OpenItemValue {
  openKey?: string
  toggle: (key: string) => void
  close: () => void
}

const OpenItemContext = createContext<OpenItemValue | undefined>(undefined)

/**
 * Remembers which item of one array is open.
 *
 * The state has to live above the items: an item cannot know that its sibling
 * should close. One provider is installed per array field, so two arrays on the
 * same document never fight over it.
 *
 * @public
 */
export function OpenItemProvider(props: {children: React.ReactNode}): React.JSX.Element {
  const [openKey, setOpenKey] = useState<string | undefined>()

  const value = useMemo<OpenItemValue>(
    () => ({
      openKey,
      toggle: (key) => setOpenKey((current) => (current === key ? undefined : key)),
      close: () => setOpenKey(undefined),
    }),
    [openKey],
  )

  return <OpenItemContext.Provider value={value}>{props.children}</OpenItemContext.Provider>
}

/**
 * The open-item state of the surrounding array.
 *
 * Falls back to a per-item state when no provider is above — that happens when
 * only the item component is overridden, and it degrades to "several items may
 * be open" rather than to an error.
 *
 * @public
 */
export function useOpenItem(): OpenItemValue | undefined {
  return useContext(OpenItemContext)
}
