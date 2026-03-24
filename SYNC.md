# Syncing with Filament's DateTimePicker

This package reuses Filament's original `date-time-picker` Blade view and JS with minimal patches.

## One-Command Sync (Blade)

```bash
php bin/sync-view.php /path/to/your/laravel-project
```

This copies Filament's Blade and applies 4 patches automatically.

## What's Changed from Filament's Original

### Blade View (`resources/views/date-time-picker.blade.php`)

4 line changes from `vendor/filament/forms/resources/views/components/date-time-picker.blade.php`:

| # | Original | Thai Patch |
|---|----------|------------|
| 1 | `getAlpineComponentSrc('date-time-picker', 'filament/forms')` | `..., 'phattarachai/filament-thai-date-picker')` |
| 2 | `x-data="dateTimePickerFormComponent({` | `x-data="thaiDateTimePickerFormComponent({` |
| 3 | _(not present)_ | `hasTime: @js($hasTime),` added to x-data params |
| 4 | `x-model.debounce="focusedYear"` | `x-model.debounce="focusedThaiYear"` |

### JS Component (`resources/js/components/date-time-picker.js`)

Based on `vendor/filament/forms/resources/js/components/date-time-picker.js`. All changes marked with `// THAI:` comments:

1. **Added** `buddhistEra` dayjs plugin import + extend
2. **Renamed** function to `thaiDateTimePickerFormComponent`
3. **Added** `hasTime` parameter
4. **Added** `focusedThaiYear` property
5. **Added** `focusedThaiYear` watcher (syncs Thai year input → Gregorian year)
6. **Modified** `focusedDate` watcher to also update `focusedThaiYear`
7. **Modified** `init()` to also init `focusedThaiYear` in `$nextTick`
8. **Modified** `setDisplayText()` to format with Buddhist Era (`D MMM BB`)
9. **Changed** default locale from `'en'` to `'th'`
10. **Reduced** locales to `en` + `th` only

## When to Re-Sync

After running `composer update` that upgrades `filament/forms`:

1. **Blade**: Run `php bin/sync-view.php /path/to/project` — done.
2. **JS**: Diff the new Filament JS against yours and port non-Thai changes:
   ```bash
   diff resources/js/components/date-time-picker.js \
        /path/to/project/vendor/filament/forms/resources/js/components/date-time-picker.js
   ```
3. **Rebuild JS**: `npm run build:scripts`

## PHP Classes (no sync needed)

`ThaiDatePicker` and `ThaiDateTimePicker` extend Filament's classes and only set:
- `$view` → package view
- `native(false)`
- `locale('th')`

These don't need syncing — they use Filament's public API.
