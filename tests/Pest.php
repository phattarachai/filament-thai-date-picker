<?php

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Livewire\Component;
use Phattarachai\FilamentThaiDatePicker\Tests\TestCase;

uses(TestCase::class)->in(__DIR__);

function renderField(DateTimePicker $field): string
{
    $field->container(Schema::make(new class extends Component implements HasForms
    {
        use InteractsWithForms;

        public function render(): string
        {
            return '<div></div>';
        }
    })->statePath('data'));

    return $field->toHtml();
}
