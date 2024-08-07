<?php

namespace Phattarachai\FilamentThaiDatePicker;


use Filament\Forms\Components\DatePicker;

class ThaiDatePicker extends DatePicker
{

    protected string $view = 'filament-thai-date-picker::date-time-picker';

    protected function setUp(): void
    {
        parent::setUp();

        $this->native(false)
            ->locale('th')
            ->time(false);
    }

}
