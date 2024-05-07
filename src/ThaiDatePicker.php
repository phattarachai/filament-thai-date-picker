<?php

namespace Phattarachai\FilamentphpThaiDatePicker;


use Filament\Forms\Components\DatePicker;

class ThaiDatePicker extends DatePicker
{

    protected string $view = 'filamentphp-thai-date-picker::date-time-picker';

    protected function setUp(): void
    {
        parent::setUp();

        $this->native(false)
            ->time(false);
    }

}
