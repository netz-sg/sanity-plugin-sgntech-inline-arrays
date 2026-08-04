# Sanity Exchange submission

Copy-paste sheet for [community.sanity.tools](https://community.sanity.tools). Everything below is
ready to go into the form fields of the same name.

## Title

```
Inline Arrays
```

## Description

```
Array items open where they sit instead of in a dialog. Sanity opens every array item in a modal, so an object inside an array inside an object means a modal inside a modal — the request to change that (issue #921) collected 38 votes over seven years and was closed as not planned. This plugin takes it on: items expand in place, one at a time, with the list and its drag handles intact, and "Open in dialog" still in the item menu for the objects that really are better in one. Two levels open inline and deeper nesting falls back to the dialog, because by then the indentation leaves too little room to type in. Images are covered too, so alt text and captions on a gallery no longer mean a dialog per picture, while crop and hotspot stay in the dialog where they have room. Arrays can also carry your own item actions — duplicate as a variant, fill from a template, clear a field — with helpers that handle keys and patches for you. Collapsed rows show presence avatars, so a colleague editing inside a closed item is visible, which is the one thing the dialog did better. The inline rendering leans on APIs Sanity marks beta and internal, so every item checks the shape first and falls back to Sanity's own rendering when it no longer matches, behind a per-item error boundary: a Studio upgrade can make the plugin ineffective, never your form unusable.
```

## Relative address in the community site

```
sgntech-inline-arrays
```

Full address: `sanity.io/plugins/sgntech-inline-arrays`

## Author(s)

```
SGNTech (@sgntech)
```

## Main image

**Logo / Icon:** `assets/icon.png` in this repository — 300 × 300 PNG.

**Background color:** pick the darkest option available; the icon is drawn on `#0D0E12` with a
`#FF5500` accent, so a dark background blends seamlessly.

## Source code

**Git repository URL**

```
https://github.com/netz-sg/sanity-plugin-sgntech-inline-arrays
```

**Raw README URL**

```
https://raw.githubusercontent.com/netz-sg/sanity-plugin-sgntech-inline-arrays/main/README.md
```

## Studio version

```
Studio v3
```

The form only offers N/A, v2 and v3. This plugin targets Studio v5 and v6, which continue the v3
architecture — v3 is the correct choice among the options given.

## Package URL

```
https://www.npmjs.com/package/sanity-plugin-sgntech-inline-arrays
```

## Installation command

```
npm i sanity-plugin-sgntech-inline-arrays
```

## Categories / Solutions

- Studio experience
- Forms & inputs
- Developer tools

Pick the closest matches the form offers; the list above is what this plugin actually is.

## Frameworks used

- React

## Integrations & services used

- none

## Contest tags

```
none
```
