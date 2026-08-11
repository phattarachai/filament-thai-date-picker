<?php

use Filament\Infolists\Components\TextEntry;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Support\Carbon;
use Phattarachai\FilamentThaiDatePicker\ThaiDatePicker;
use Phattarachai\FilamentThaiDatePicker\ThaiDateTimePicker;

it('configures ThaiDatePicker as a non-native Thai date field', function () {
    $picker = ThaiDatePicker::make('order_date');

    expect($picker->getView())->toBe('filament-thai-date-picker::date-time-picker')
        ->and($picker->isNative())->toBeFalse()
        ->and($picker->getLocale())->toBe('th');
});

it('configures ThaiDateTimePicker as a non-native Thai datetime field', function () {
    $picker = ThaiDateTimePicker::make('transfer_at');

    expect($picker->getView())->toBe('filament-thai-date-picker::date-time-picker')
        ->and($picker->isNative())->toBeFalse()
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
