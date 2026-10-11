<?php

namespace Phattarachai\FilamentThaiDatePicker;

use Filament\Forms\Components\DateTimePicker;
use Phattarachai\FilamentThaiDatePicker\Concerns\RendersThaiPicker;

class ThaiDateTimePicker extends DateTimePicker
{
    use RendersThaiPicker;

    protected function setUp(): void
    {
        parent::setUp();

        $this->native(false)
            ->locale('th')
            ->defaultDateDisplayFormat('j M y')
            ->defaultDateTimeDisplayFormat('j M y H:i')
            ->defaultDateTimeWithSecondsDisplayFormat('j M y H:i');
    }
}
