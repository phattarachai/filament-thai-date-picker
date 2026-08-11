# Syncing with Filament's DateTimePicker

This package reuses Filament's `date-time-picker` markup and JS with minimal Thai patches. It
keeps a **standalone Blade view** (`resources/views/date-time-picker.blade.php`) and a **forked
Alpine component** (`resources/js/components/date-time-picker.js`), both wired in through the
`$view` override on `ThaiDatePicker` / `ThaiDateTimePicker`.

## Filament 5 changed the source

Filament 5 no longer ships a `date-time-picker.blade.php`. `DateTimePicker` implements
`HasEmbeddedView` and renders from `toEmbeddedHtml()` in
`vendor/filament/forms/src/Components/DateTimePicker.php`. Setting `$view` on our subclasses makes
`ViewComponent::toHtml()` render our Blade instead of the embedded HTML (it returns the view
whenever `hasView()` is true), so the override still works — but there is no upstream Blade file to
copy from anymore. The old one-command `bin/sync-view.php` was removed for this reason.

## Re-syncing after a `filament/forms` upgrade

1. **Blade** — diff our view against Filament's embedded markup and port any non-Thai change:
   ```bash
   # Filament's current structure lives in the toEmbeddedHtml() method:
   less vendor/filament/forms/src/Components/DateTimePicker.php
   ```
   Our view is a hand-maintained fork; there is no automated copy. Keep the Thai patches (below).
2. **JS** — diff and port non-Thai changes:
   ```bash
   diff resources/js/components/date-time-picker.js \
        vendor/filament/forms/resources/js/components/date-time-picker.js
   ```
3. **Rebuild JS**: `npm run build` (esbuild; there is no CSS build — see below).

## Thai patches

### Blade (`resources/views/date-time-picker.blade.php`)

- `getAlpineComponentSrc('date-time-picker', 'phattarachai/filament-thai-date-picker')`
- `x-data="thaiDateTimePickerFormComponent({ ..., hasTime: @js($hasTime) })"`
- Year input bound to `focusedThaiYear` instead of `focusedYear`

### JS (`resources/js/components/date-time-picker.js`) — changes marked `// THAI:`

- `buddhistEra` dayjs plugin (replaces Filament's `advancedFormat`, which the fork doesn't need
  since `setDisplayText()` is overridden)
- Renamed to `thaiDateTimePickerFormComponent`, added `hasTime` param
- `focusedThaiYear` property + watcher (syncs Thai year input → Gregorian `focusedDate`), also
  updated in `init()` and the `focusedDate` watcher
- `setDisplayText()` formats with Buddhist Era (`D MMM BB` / `D MMM BB HH:mm`)
- Default locale `'th'`; locale list reduced to `en` + `th`

## No CSS build

The package ships no stylesheet — the fork reuses Filament's own `fi-fo-*` classes, which the host
Filament theme already styles. The former Tailwind/PostCSS/purge chain compiled only a dead
`-webkit-datetime-edit` rule (the picker runs `native(false)`, so no native input exists) and was
never registered, so it was removed. `package.json` builds JS only.

## PHP classes (no sync needed)

`ThaiDatePicker` and `ThaiDateTimePicker` extend Filament's classes and only set `$view`,
`native(false)`, and `locale('th')` — Filament's public API, nothing to sync.
