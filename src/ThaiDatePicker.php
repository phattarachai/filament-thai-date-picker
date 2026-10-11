<?php

namespace Phattarachai\FilamentThaiDatePicker;

use Filament\Forms\Components\DatePicker;
use Phattarachai\FilamentThaiDatePicker\Concerns\RendersThaiPicker;

class ThaiDatePicker extends DatePicker
{
    use RendersThaiPicker;

    protected function setUp(): void
    {
        parent::setUp();

        $this->native(false)
            ->locale('th')
            ->time(false);
    }
}
