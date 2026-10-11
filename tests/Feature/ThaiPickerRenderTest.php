<?php

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\Facades\Exceptions;
use Livewire\Component;
use Phattarachai\FilamentThaiDatePicker\ThaiDatePicker;
use Phattarachai\FilamentThaiDatePicker\ThaiDateTimePicker;

it('renders ThaiDatePicker with the Thai Alpine component', function () {
    $html = renderField(ThaiDatePicker::make('order_date'));

    expect($html)
        ->toContain('x-load-src="'.e(FilamentAsset::getAlpineComponentSrc('date-time-picker', 'phattarachai/filament-thai-date-picker')).'"')
        ->not->toContain(e(FilamentAsset::getAlpineComponentSrc('date-time-picker', 'filament/forms')))
        ->toContain('x-data="thaiDateTimePickerFormComponent({')
        ->toContain('x-model.debounce="focusedThaiYear"')
        ->not->toContain('x-model.debounce="focusedYear"');
});

it('renders ThaiDateTimePicker with the Thai Alpine component', function () {
    expect(renderField(ThaiDateTimePicker::make('transfer_at')))
        ->toContain('x-data="thaiDateTimePickerFormComponent({')
        ->toContain('hasDate: true,')
        ->toContain('x-model.debounce="focusedThaiYear"');
});

it('renders a time-only ThaiDateTimePicker without the year input', function () {
    expect(renderField(ThaiDateTimePicker::make('opens_at')->date(false)))
        ->toContain('x-data="thaiDateTimePickerFormComponent({')
        ->toContain('hasDate: false,')
        ->not->toContain('fi-fo-date-time-picker-year-input');
});

it('defaults the display format to a short Thai date', function (DateTimePicker $picker, string $format) {
    expect(renderField($picker))->toContain("displayFormat: '{$format}',");
})->with([
    'date' => [fn () => ThaiDatePicker::make('order_date'), 'D MMM YY'],
    'datetime' => [fn () => ThaiDateTimePicker::make('transfer_at'), 'D MMM YY HH:mm'],
    'datetime without seconds' => [fn () => ThaiDateTimePicker::make('transfer_at')->seconds(false), 'D MMM YY HH:mm'],
]);

it('honours a custom displayFormat', function () {
    expect(renderField(ThaiDatePicker::make('order_date')->displayFormat('d/m/Y')))
        ->toContain("displayFormat: 'DD\\/MM\\/YYYY',");
});

it('keeps the time-only display format from Filament', function () {
    expect(renderField(ThaiDateTimePicker::make('opens_at')->date(false)->seconds(false)))
        ->toContain("displayFormat: 'HH:mm',");
});

it('passes date limits in the format the forked JS reads', function () {
    expect(renderField(ThaiDatePicker::make('order_date')->minDate('2026-01-01')->maxDate('2026-12-31')))
        ->toContain('<input x-ref="minDate" type="hidden" value="2026-01-01 00:00:00" />')
        ->toContain('<input x-ref="maxDate" type="hidden" value="2026-12-31 23:59:59" />');
});

it('leaves the native input untouched', function () {
    expect(renderField(ThaiDatePicker::make('order_date')->native()))
        ->toContain('type="date"')
        ->not->toContain('x-load-src');
});

it('falls back to the stock picker and reports when Filament markup changes', function () {
    Exceptions::fake();

    $picker = new class('stub') extends ThaiDatePicker
    {
        protected function getThaiPatches(): array
        {
            return [...parent::getThaiPatches(), 'markup Filament no longer renders' => ''];
        }
    };

    expect(renderField($picker::make('order_date')))
        ->toContain('x-data="dateTimePickerFormComponent({')
        ->toContain(e(FilamentAsset::getAlpineComponentSrc('date-time-picker', 'filament/forms')))
        ->toContain('x-model.debounce="focusedYear"');

    Exceptions::assertReported(fn (LogicException $e) => str_contains($e->getMessage(), 'markup Filament no longer renders'));
});

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
