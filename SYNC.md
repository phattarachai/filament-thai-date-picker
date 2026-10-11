# Syncing with Filament's DateTimePicker

This package reuses Filament's `date-time-picker` markup and JS with minimal Thai patches:

- **Markup** is Filament's own. `ThaiDatePicker` / `ThaiDateTimePicker` use the
  `Concerns\RendersThaiPicker` trait, which calls `DateTimePicker::toEmbeddedHtml()` and applies the
  Thai patches as exact string replacements. There is no forked Blade view.
- **JS** is a forked Alpine component (`resources/js/components/date-time-picker.js`), built to
  `resources/dist` and registered under `phattarachai/filament-thai-date-picker`.

Last synced with **filament/forms v5.10.1**. `composer.json` requires `filament/forms: ^5.10.1`, because
the JS fork expects the markup of that version (the `hasDate` option, and the min/max limits that
`getDateLimitForInput()` normalises to `Y-m-d H:i:s`).

## Why not a forked Blade view

Filament 5 renders `DateTimePicker` from `toEmbeddedHtml()`, not a Blade file. Up to 4.0.x the package
kept a hand-copied Blade view behind a `$view` override, and it drifted: by 5.10.1 upstream had moved
the trigger, added accessibility attributes, and passed the date limits through a protected
`getDateLimitForInput()` that a Blade view cannot call. Patching the rendered HTML picks up those
changes for free.

If a patch's search string is no longer found exactly once, `toEmbeddedHtml()` renders the **stock**
Filament picker (Gregorian, still working) and `report()`s a `LogicException`. It never renders a
half-patched picker. `tests/Feature/ThaiPickerRenderTest.php` asserts every patch applies, so CI on a new
Filament release fails before users see the fallback.

## Re-syncing after a `filament/forms` upgrade

1. **Markup**: run `vendor/bin/pest`. If the render tests pass, the markup needs nothing. If they fail,
   read `toEmbeddedHtml()` in `vendor/filament/forms/src/Components/DateTimePicker.php` and update the
   search strings in `RendersThaiPicker::getThaiPatches()`.
2. **JS**: diff and port every non-Thai change:
   ```bash
   diff resources/js/components/date-time-picker.js \
        vendor/filament/forms/resources/js/components/date-time-picker.js
   ```
   The cleanest way is to start from the upstream file and re-apply the `// THAI:` patches below.
   Then bump the version in the file's header comment and the `filament/forms` floor in `composer.json`.
3. **Rebuild JS** with `npm run build` (esbuild; there is no CSS build, see below) and commit
   `resources/dist`.

## Thai patches

### Markup (`src/Concerns/RendersThaiPicker.php`)

- `x-load-src`: Filament's `date-time-picker` component URL is swapped for ours
- `x-data="dateTimePickerFormComponent({` → `thaiDateTimePickerFormComponent({`
- The year input's `x-model.debounce="focusedYear"` → `focusedThaiYear` (only when `hasDate()`, since a
  time-only picker has no year input)

The native input (`->native()`) is left untouched.

### JS (`resources/js/components/date-time-picker.js`): changes marked `// THAI:`

- `buddhistEra` dayjs plugin, alongside Filament's `advancedFormat`
- Renamed to `thaiDateTimePickerFormComponent`
- `displayFormat` year tokens become Buddhist Era (`YYYY` → `BBBB`, `YY` → `BB`, `[escaped]` text
  untouched) before the component uses it. `setDisplayText()` itself is upstream's, unpatched.
- `focusedThaiYear` property + watcher (syncs Thai year input → Gregorian `focusedDate`), also
  updated in `init()` and the `focusedDate` watcher
- Default locale `'th'`; locale list reduced to `en` + `th`

## Known behaviour inherited from Filament

A time input typed out of range (e.g. minute `75`) is reset to `0` by the component's `minute` watcher
and saved without a validation error. Stock Filament 5.10.1 does the same, so the fork does not diverge here.

## No CSS build

The package ships no stylesheet. The fork reuses Filament's own `fi-fo-*` classes, which the host
Filament theme already styles. `package.json` builds JS only.

## PHP classes

`ThaiDatePicker` and `ThaiDateTimePicker` extend Filament's classes, set `native(false)`,
`locale('th')` and Thai default display formats (`j M y`, `j M y H:i`, the latter also when seconds are
enabled), and use `RendersThaiPicker`. A user's `displayFormat()` overrides the defaults; time-only
pickers keep Filament's default time formats. Everything else is Filament's public API.
