<?php

use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Concerns\InteractsWithSchemas;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Support\Carbon;
use Livewire\Component;
use Phattarachai\FilamentThaiDatePicker\ThaiDatePicker;
use Phattarachai\FilamentThaiDatePicker\ThaiDateTimePicker;

it('configures ThaiDatePicker as a non-native Thai date field', function () {
    $picker = ThaiDatePicker::make('order_date');

    expect($picker->isNative())->toBeFalse()
        ->and($picker->getLocale())->toBe('th');
});

it('configures ThaiDateTimePicker as a non-native Thai datetime field', function () {
    $picker = ThaiDateTimePicker::make('transfer_at');

    expect($picker->isNative())->toBeFalse()
        ->and($picker->getLocale())->toBe('th');
});

it('registers the thaidate macros on table columns and infolist entries', function () {
    expect(TextColumn::hasMacro('thaidate'))->toBeTrue()
        ->and(TextColumn::hasMacro('thaidatetime'))->toBeTrue()
        ->and(TextEntry::hasMacro('thaidate'))->toBeTrue()
        ->and(TextEntry::hasMacro('thaidatetime'))->toBeTrue();
});

it('formats a Gregorian date into the Buddhist era via the Carbon macro', function () {
    expect(Carbon::parse('2024-05-18')->thaidate('j M y'))->toBe('18 พ.ค. 67');
});

it('shows timeDescription() in the column timezone', function () {
    $column = TextColumn::make('delivered_at')
        ->thaidate()
        ->timeDescription()
        ->timezone('Asia/Bangkok')
        ->table(testTable())
        ->record(['__key' => 1, 'delivered_at' => Carbon::parse('2026-10-18 07:30:00', 'UTC')]);

    expect($column->getDescriptionBelow())->toBe('14:30');
});

it('leaves timeDescription() empty when the date is null', function () {
    $column = TextColumn::make('delivered_at')
        ->timeDescription()
        ->table(testTable())
        ->record(['__key' => 1, 'delivered_at' => null]);

    expect($column->getDescriptionBelow())->toBeNull();
});

function testTable(): Table
{
    return Table::make(new class extends Component implements HasActions, HasSchemas, HasTable
    {
        use InteractsWithActions;
        use InteractsWithSchemas;
        use InteractsWithTable;

        public function render(): string
        {
            return '<div></div>';
        }
    });
}
