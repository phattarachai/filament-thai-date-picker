#!/usr/bin/env php
<?php

/**
 * Sync ThaiDatePicker Blade view from Filament's original.
 *
 * Copies Filament's date-time-picker.blade.php and applies 4 patches:
 *   1. x-load-src → our package
 *   2. x-data function name → thaiDateTimePickerFormComponent
 *   3. Add hasTime param to x-data
 *   4. Year input x-model → focusedThaiYear
 *
 * Usage:
 *   php bin/sync-view.php /path/to/laravel-project
 *
 * Example:
 *   php bin/sync-view.php /home/phatchai/oun-jai
 */

$projectPath = $argv[1] ?? null;

if (! $projectPath || ! is_dir($projectPath)) {
    echo "Usage: php bin/sync-view.php /path/to/laravel-project\n";
    echo "Example: php bin/sync-view.php /home/phatchai/oun-jai\n";
    exit(1);
}

$source = rtrim($projectPath, '/') . '/vendor/filament/forms/resources/views/components/date-time-picker.blade.php';
$target = __DIR__ . '/../resources/views/date-time-picker.blade.php';

if (! file_exists($source)) {
    echo "ERROR: Source file not found:\n  {$source}\n";
    echo "Make sure filament/forms is installed in the project.\n";
    exit(1);
}

$content = file_get_contents($source);
$original = $content;

// Patch 1: x-load-src package reference
$content = str_replace(
    "getAlpineComponentSrc('date-time-picker', 'filament/forms')",
    "getAlpineComponentSrc('date-time-picker', 'phattarachai/filament-thai-date-picker')",
    $content
);

// Patch 2: x-data function name
$content = str_replace(
    'x-data="dateTimePickerFormComponent({',
    'x-data="thaiDateTimePickerFormComponent({',
    $content
);

// Patch 3: Add hasTime param (after isAutofocused line)
$content = str_replace(
    "isAutofocused: @js(\$isAutofocused),",
    "hasTime: @js(\$hasTime),\n                            isAutofocused: @js(\$isAutofocused),",
    $content
);

// Patch 4: Year input Thai year
$content = str_replace(
    'x-model.debounce="focusedYear"',
    'x-model.debounce="focusedThaiYear"',
    $content
);

// Add header comment
$header = "{{-- Thai DatePicker: patched from Filament's date-time-picker.blade.php --}}\n";
$header .= "{{-- Changes marked with \"THAI:\" comments. Run `php bin/sync-view.php` to re-sync. --}}\n";
$content = $header . $content;

// Verify all patches were applied
$patchCount = 0;
if (strpos($content, 'phattarachai/filament-thai-date-picker') !== false) $patchCount++;
if (strpos($content, 'thaiDateTimePickerFormComponent') !== false) $patchCount++;
if (strpos($content, 'hasTime: @js($hasTime)') !== false) $patchCount++;
if (strpos($content, 'focusedThaiYear') !== false) $patchCount++;

if ($patchCount < 4) {
    echo "WARNING: Only {$patchCount}/4 patches applied. Filament's view may have changed.\n";
    echo "Check the source file manually and update the patches in this script.\n";
    echo "Source: {$source}\n";
}

file_put_contents($target, $content);

// Get Filament version
$filamentVersion = 'unknown';
$lockFile = rtrim($projectPath, '/') . '/composer.lock';
if (file_exists($lockFile)) {
    $lock = json_decode(file_get_contents($lockFile), true);
    foreach ($lock['packages'] ?? [] as $pkg) {
        if ($pkg['name'] === 'filament/forms') {
            $filamentVersion = $pkg['version'];
            break;
        }
    }
}

echo "Synced from Filament {$filamentVersion}\n";
echo "  Source: {$source}\n";
echo "  Target: {$target}\n";
echo "  Patches applied: {$patchCount}/4\n";
