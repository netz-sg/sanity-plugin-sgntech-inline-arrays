<!-- Social preview / OpenGraph image -->
<p align="center">
  <img src="https://raw.githubusercontent.com/netz-sg/sanity-plugin-sgntech-inline-arrays/main/assets/og-image.png" alt="sanity-plugin-sgntech-inline-arrays — edit array items where they sit" width="640" />
</p>

<h1 align="center">sanity-plugin-sgntech-inline-arrays</h1>

<p align="center">
  Edit array items where they sit instead of in a dialog, with your own actions per item.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/sanity-plugin-sgntech-inline-arrays"><img alt="npm version" src="https://img.shields.io/npm/v/sanity-plugin-sgntech-inline-arrays.svg?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/npm/l/sanity-plugin-sgntech-inline-arrays.svg?style=flat-square" /></a>
</p>

---

## Why this exists

Sanity opens every array item in a modal. An object inside an array inside an object means a modal
inside a modal — what one team in the issue thread calls **"modal hell"**.

[Issue #921](https://github.com/sanity-io/sanity/issues/921) asked for inline editing in August
2018. It collected 38 votes, and in February 2025 it was **closed as not planned**. From the
thread:

> Our content team has been complaining about modal hell. Opening multiple levels of modals makes
> it really hard to write content.

> We had a project where this missing feature was one of the reasons our team decided to use
> CraftCMS over Sanity.

A plugin is now the only way this happens.

## What you get

- **Items open where they sit.** One at a time, in place, with the list and its drag handles intact.
- **The dialog stays.** "Open in dialog" is in every item's menu — some objects really are better in one.
- **A depth limit that is honest.** Two levels open in place; deeper than that the indentation leaves too little room to type in, so it falls back to the dialog. Configurable.
- **Images too.** Alt text and captions on a gallery without a dialog per picture. Crop and hotspot stay in the dialog, where they have room.
- **Your own item actions.** "Duplicate as variant", "fill from template", whatever the array needs — with helpers, so no `_key` juggling.
- **Presence on closed rows.** If a colleague is editing inside a collapsed item you can see them, which is the one thing a dialog did better.
- **It cannot take your Studio down.** See [safety](#safety) below.

## Installation

```sh
npm install sanity-plugin-sgntech-inline-arrays
```

Sanity Studio 6.9.2 or newer (Sanity UI v4) and React 19.2. For Studio v5 or older v6 releases, install version 1.x.

## Usage

```ts
// sanity.config.ts
import {defineConfig} from 'sanity'
import {inlineArrays} from 'sanity-plugin-sgntech-inline-arrays'

export default defineConfig({
  // ...
  plugins: [inlineArrays()],
})
```

That is the whole setup. Every array in the Studio now opens its items in place.

### Opting out

Per field:

```ts
defineField({
  name: 'gallery',
  type: 'array',
  options: {inline: false}, // keeps Sanity's dialog
  of: [/* … */],
})
```

Per type, or for the whole Studio:

```ts
inlineArrays({
  exclude: ['heavyObject'], // these always use the dialog
  mode: false, // off by default; fields opt in with options.inline
})
```

`options.inline` takes `false`, `'accordion'` (the default) or `'open'` — the last shows every
item expanded, which suits short arrays of two or three fields.

### Options

```ts
inlineArrays({
  maxDepth: 2, // levels that open in place; deeper falls back to the dialog
  mode: 'accordion', // 'accordion' | 'open' | false
  exclude: [], // type names that always use the dialog
  itemActions: undefined, // see below
})
```

## Item actions

[Issue #4665](https://github.com/sanity-io/sanity/issues/4665) asked for actions beyond
Remove/Duplicate. The resolver follows the shape of Sanity's own document actions:

```ts
import {CopyIcon} from '@sanity/icons/Copy'

inlineArrays({
  itemActions: (previous, context) => {
    if (context.schemaType.name !== 'setlistEntry') return previous

    return [
      ...previous,
      {
        name: 'variant',
        label: 'Duplicate as variant',
        icon: CopyIcon,
        onHandle: (action) => action.insertAfter({...action.value, variant: 'Acoustic'}),
      },
      {
        name: 'clear',
        label: 'Clear the note',
        tone: 'critical',
        // A string disables the entry and says why, in the tooltip.
        disabled: context.value.note ? false : 'Nothing to clear',
        confirm: 'Really clear the note?',
        onHandle: (action) => action.patch({note: undefined}),
      },
    ]
  },
})
```

The resolver is given `value`, `index`, `path`, `schemaType`, `parentSchemaType`, `documentId` and
`documentType`. An action's `onHandle` is given those plus helpers:

| Helper | Does |
| --- | --- |
| `set(next)` | Replaces the item, keeping its `_key` |
| `patch(fields)` | Changes single fields; `undefined` removes one |
| `insertAfter(next)` | New sibling after this item, `_key` generated |
| `insertBefore(next)` | New sibling before it |
| `remove()` | Removes the item |

Everything goes through the form, so it lands in the document history and stays undoable.

## Safety

The archived experiment this follows —
[`sanity-plugin-advanced-array`](https://github.com/SimeonGriggs/sanity-plugin-advanced-array) by a
Sanity developer — proved the idea and named where it breaks: virtualized lists, presence
indicators, performance. It was never published and says outright it is *"not recommended for
production use"*. Those three are the reason this plugin exists, so each is answered:

**The beta API.** Inline rendering leans on `inputProps`, which Sanity marks `@beta @hidden`, and
on `ObjectInputMember`, marked `@internal`. Every item checks the shape is still what it expects
and calls `renderDefault` when it is not. On top of that each item sits behind an error boundary,
so one item that throws falls back on its own rather than taking the form with it. **A Studio
upgrade can make this plugin ineffective; it cannot make your Studio unusable.**

**Performance.** Only the open item renders inputs — collapsed items stay the preview rows Sanity
already draws, and its own list handling is untouched. The cost of an array does not grow with its
length.

**Presence.** Avatars appear on the collapsed row when somebody is working inside that item, and on
the fields themselves once it is open.

## What it does not touch

References, primitives, files, geopoints and slugs keep Sanity's own interface — they either edit
in place already or genuinely need a dialog's room. So do arrays past `maxDepth`, fields that opted
out, and anything in `exclude`.

## Verified against

Sanity Studio **6.8.0**, React **19.2.8**. Because the APIs involved are marked beta and internal,
re-check after a Studio upgrade; the fallback means the failure mode is "the plugin stops
applying", not a broken form.

## Develop

```sh
npm install
npm test            # the decision logic: modes, depth, supported types
npm run lint
npm run build
npm run link-watch
```

Built with [@sanity/plugin-kit](https://github.com/sanity-io/plugins/tree/main/packages/@sanity/plugin-kit).

## License

MIT © SGNTech
