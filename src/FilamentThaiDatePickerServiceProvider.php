<?php

namespace Phattarachai\FilamentThaiDatePicker;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Facades\FilamentAsset;
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
    }

    /**
     * @return array<string>
     */
    protected function getRoutes(): array
    {
        return [];
    }

}
