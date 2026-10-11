<?php

namespace Phattarachai\FilamentThaiDatePicker\Concerns;

use Filament\Support\Facades\FilamentAsset;
use LogicException;

/**
 * Renders Filament's own date-time picker markup with the Thai patches applied, so markup
 * changes in filament/forms are picked up without a forked Blade view. See SYNC.md.
 */
trait RendersThaiPicker
{
    public function toEmbeddedHtml(): string
    {
        $html = parent::toEmbeddedHtml();

        if ($this->isNative()) {
            return $html;
        }

        $patches = $this->getThaiPatches();

        foreach ($patches as $search => $replace) {
            if (substr_count($html, $search) !== 1) {
                // Filament's markup changed: render the stock picker instead of a half-patched one.
                report(new LogicException("[phattarachai/filament-thai-date-picker] Filament's date-time picker markup no longer contains [{$search}]. See SYNC.md."));

                return $html;
            }
        }

        return strtr($html, $patches);
    }

    /**
     * @return array<string, string>
     */
    protected function getThaiPatches(): array
    {
        $patches = [
            e(FilamentAsset::getAlpineComponentSrc('date-time-picker', 'filament/forms')) => e(FilamentAsset::getAlpineComponentSrc('date-time-picker', 'phattarachai/filament-thai-date-picker')),
            'x-data="dateTimePickerFormComponent({' => 'x-data="thaiDateTimePickerFormComponent({',
        ];

        if ($this->hasDate()) {
            $patches['x-model.debounce="focusedYear"'] = 'x-model.debounce="focusedThaiYear"';
        }

        return $patches;
    }
}
