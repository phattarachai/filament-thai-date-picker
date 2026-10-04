<?php

use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Livewire\Component;
use Livewire\Livewire;
use Phattarachai\FilamentThaiDatePicker\ThaiDatePicker;
use Phattarachai\FilamentThaiDatePicker\ThaiDateTimePicker;

class ThaiDatePickerTestForm extends Component implements HasForms
{
    use InteractsWithForms;

    public ?array $data = [];

    public ?string $minDate = null;

    public function mount(): void
    {
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                ThaiDatePicker::make('date')->minDate($this->minDate),
                ThaiDateTimePicker::make('date_time'),
            ])
            ->statePath('data');
    }

    public function render(): string
    {
        return '<div>{{ $this->form }}</div>';
    }
}

it('keeps Livewire from morphing the Alpine picker', function () {
    $html = Livewire::test(ThaiDatePickerTestForm::class)->html();

    expect(preg_match_all('/x-data="thaiDateTimePickerFormComponent\([^"]*\)"\s+wire:ignore\s+wire:key="[^"]+\.data\.date(_time)?\.[^"]+\.[0-9a-f]{32}"/s', $html))
        ->toBe(2);
});

it('changes the picker wire:key when its constraints change', function () {
    $wireKey = fn (string $html): string => preg_match(
        '/x-data="thaiDateTimePickerFormComponent\\([^"]*\\)"\\s+wire:ignore\\s+wire:key="([^"]+\\.data\\.date\\.[^"]+)"/s',
        $html,
        $matches,
    ) ? $matches[1] : '';

    $form = Livewire::test(ThaiDatePickerTestForm::class);
    $initialKey = $wireKey($form->html());

    expect($initialKey)->not->toBe('')
        ->and($wireKey($form->set('data.date', '2026-10-05')->html()))->toBe($initialKey)
        ->and($wireKey($form->set('minDate', '2026-01-01')->html()))->not->toBe($initialKey);
});
