import {describe, expect, it} from 'vitest'

import {decideMode, isSupportedItem, itemDepth, modeFromOptions} from './decide'

const objectType = {name: 'track', type: {name: 'object', jsonType: 'object'}}
const imageType = {name: 'photo', type: {name: 'image', jsonType: 'object'}}
const referenceType = {name: 'author', type: {name: 'reference', jsonType: 'object'}}

const key = (value: string) => ({_key: value})

describe('isSupportedItem', () => {
  it('takes objects and images', () => {
    expect(isSupportedItem(objectType)).toBe(true)
    expect(isSupportedItem(imageType)).toBe(true)
  })

  it('leaves what Sanity already edits in place alone', () => {
    expect(isSupportedItem(referenceType)).toBe(false)
    expect(isSupportedItem({name: 'where', type: {name: 'geopoint', jsonType: 'object'}})).toBe(false)
    expect(isSupportedItem({name: 'attachment', type: {name: 'file', jsonType: 'object'}})).toBe(false)
  })

  it('honours the exclude list by any name in the chain', () => {
    expect(isSupportedItem(objectType, ['track'])).toBe(false)
    expect(isSupportedItem(imageType, ['photo'])).toBe(false)
    expect(isSupportedItem(objectType, ['somethingElse'])).toBe(true)
  })

  it('says no to what it cannot read', () => {
    expect(isSupportedItem(undefined)).toBe(false)
    expect(isSupportedItem({})).toBe(false)
    expect(isSupportedItem('track')).toBe(false)
  })
})

describe('itemDepth', () => {
  it('counts array items, not field names', () => {
    expect(itemDepth(['gallery', key('a')])).toBe(1)
    expect(itemDepth(['gallery', key('a'), 'items', key('b')])).toBe(2)
    expect(itemDepth(['gallery', key('a'), 'items', key('b'), 'more', key('c')])).toBe(3)
  })

  it('is zero without a path', () => {
    expect(itemDepth(undefined)).toBe(0)
    expect(itemDepth([])).toBe(0)
    expect(itemDepth(['title'])).toBe(0)
  })
})

describe('modeFromOptions', () => {
  it('reads the modes it knows', () => {
    expect(modeFromOptions({inline: false})).toBe(false)
    expect(modeFromOptions({inline: 'open'})).toBe('open')
    expect(modeFromOptions({inline: 'accordion'})).toBe('accordion')
  })

  it('accepts the obvious `true`', () => {
    expect(modeFromOptions({inline: true})).toBe('accordion')
  })

  it('ignores what it does not understand', () => {
    expect(modeFromOptions({inline: 'sideways'})).toBeUndefined()
    expect(modeFromOptions({})).toBeUndefined()
    expect(modeFromOptions(undefined)).toBeUndefined()
  })
})

describe('decideMode', () => {
  const base = {config: {}, schemaType: objectType, path: ['items', key('a')]}

  it('opens in place by default', () => {
    expect(decideMode(base)).toBe('accordion')
  })

  it('lets a field opt out', () => {
    expect(decideMode({...base, parentOptions: {inline: false}})).toBe(false)
  })

  it('lets a field ask for everything open', () => {
    expect(decideMode({...base, parentOptions: {inline: 'open'}})).toBe('open')
  })

  it('lets the plugin default be changed', () => {
    expect(decideMode({...base, config: {mode: 'open'}})).toBe('open')
    expect(decideMode({...base, config: {mode: false}})).toBe(false)
  })

  it('gives the field the last word over the plugin default', () => {
    expect(decideMode({...base, config: {mode: 'open'}, parentOptions: {inline: 'accordion'}})).toBe(
      'accordion',
    )
  })

  it('falls back to the dialog past maxDepth', () => {
    const deep = ['a', key('1'), 'b', key('2'), 'c', key('3')]
    expect(decideMode({...base, path: deep})).toBe(false)
    expect(decideMode({...base, path: deep, config: {maxDepth: 3}})).toBe('accordion')
  })

  it('still opts out at a depth it would otherwise allow', () => {
    expect(decideMode({...base, config: {maxDepth: 9}, parentOptions: {inline: false}})).toBe(false)
  })

  it('leaves unsupported item types to Sanity', () => {
    expect(decideMode({...base, schemaType: referenceType})).toBe(false)
  })

  it('opts out even when the field asked for inline, if the type is unsupported', () => {
    expect(decideMode({...base, schemaType: referenceType, parentOptions: {inline: 'open'}})).toBe(
      false,
    )
  })
})
