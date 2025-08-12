<?php

namespace Phattarachai\FilamentThaiDatePicker;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;
use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Facades\FilamentAsset;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Support\Carbon;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentThaiDatePickerServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-thai-date-picker';

    public static string $viewNamespace = 'filament-thai-date-picker';

    public function configurePackage(Package $package): void
    {
        $package->name('filament-thai-date-picker');

        if (file_exists($package->basePath('/../resources/views'))) {
            $package->hasViews(static::$viewNamespace);
        }
    }

    public function packageRegistered(): void
    {
    }

    public function packageBooted(): void
    {
        FilamentAsset::register([
            AlpineComponent::make('date-time-picker', __DIR__ . '/../resources/dist/components/date-time-picker.js'),
        ], 'phattarachai/filament-thai-date-picker');

        $this->configureTableColumns();
        $this->configureInfolists();
    }

    public function configureTableColumns(): void
    {
        TextColumn::macro('thaidate', function (?string $format = null, ?string $timezone = null, ?string $default = null) {

            $this->isDate = true;

            $format ??= 'j M y';

            if ($default) {
                $this->default($default);
            }

            $this->formatStateUsing(static function (TextColumn $column, $state) use ($format, $timezone, $default): ?string {
                if (blank($state)) {
                    return $default;
                }

                if ($state === $default) {
                    return $default;
                }

                return Carbon::parse($state)
                    ->setTimezone($timezone ?? $column->getTimezone())
                    ->thaidate($format);
            });

            return $this;
        });

        TextColumn::macro('thaidatetime', function (?string $format = null, ?string $timezone = null, ?string $default = null) {

            $this->isDateTime = true;
            $format ??= 'j M y H:i';

            return $this->thaidate($format, $timezone, $default);
        });

        TextColumn::macro('timeDescription', function (?string $format = 'H:i') {
            return $this->description(fn($state) => $state?->format($format));
        });
    }

    public function configureInfolists(): void
    {
        TextEntry::macro('thaidate', function (?string $format = null, ?string $timezone = null, ?string $default = null) {

            $this->isDate = true;

            $format ??= 'j M y';

            if ($default) {
                $this->default($default);
            }

            $this->formatStateUsing(static function (TextEntry $component, $state) use ($format, $timezone, $default): ?string {
                if (blank($state)) {
                    return $default;
                }

                if ($state === $default) {
                    return $default;
                }

                return Carbon::parse($state)
                    ->setTimezone($timezone ?? $component->getTimezone())
                    ->thaidate($format);
            });

            return $this;
        });

        TextEntry::macro('thaidatetime', function (?string $format = null, ?string $timezone = null, ?string $default = null) {

            $this->isDateTime = true;
            $format ??= 'j M y H:i';

            $this->thaidate($format, $timezone, $default);

            return $this;
        });

    }

    protected function getRoutes(): array
    {
        return [];
    }

}
