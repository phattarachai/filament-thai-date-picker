<?php

use Filament\Forms\Components\DateTimePicker;
use Illuminate\Support\Facades\Process;
use Phattarachai\FilamentThaiDatePicker\ThaiDatePicker;
use Phattarachai\FilamentThaiDatePicker\ThaiDateTimePicker;

/*
 * Filament's markup comes from the installed filament/forms, but the Alpine component it binds to is our
 * fork in resources/dist. When upstream adds a property the fork lacks, the PHP render tests still pass
 * while the browser throws "X is not defined". These tests read every identifier the rendered markup uses
 * and check that the built component defines it. See SYNC.md.
 */

it('defines every Alpine identifier the rendered markup uses', function (DateTimePicker $picker) {
    $html = renderField($picker);

    $undefined = array_values(array_diff(
        alpineIdentifiersUsedByComponent($html),
        [...distComponentKeys(), ...alpineDataKeysDeclaredInMarkup($html)],
    ));

    expect($undefined)->toBe([], 'The rendered markup uses identifiers that resources/dist does not define: '.implode(', ', $undefined).'. Re-sync the JS fork (SYNC.md).');
})->with([
    'date' => [fn () => ThaiDatePicker::make('order_date')],
    'date-time' => [fn () => ThaiDateTimePicker::make('transfer_at')],
    'date-time with seconds' => [fn () => ThaiDateTimePicker::make('transfer_at')->seconds()],
    'time only' => [fn () => ThaiDateTimePicker::make('opens_at')->date(false)],
    'disabled' => [fn () => ThaiDatePicker::make('order_date')->disabled()],
]);

it('dispatches the ready event that Filament\'s loading placeholder waits for', function () {
    $html = renderField(ThaiDatePicker::make('order_date'));

    if (! str_contains($html, 'x-on:async-component-ready')) {
        // Filament < 5.12 renders no loading placeholder.
        expect($html)->not->toContain('fi-async-component');

        return;
    }

    expect(file_get_contents(distPath()))->toContain('async-component-ready');
});

it('flags an identifier the component does not define', function () {
    $html = '<div x-data="thaiDateTimePickerFormComponent({})"><div x-text="getCalendarLabel()" x-show="isPanelOpen"></div></div>';

    expect(array_diff(alpineIdentifiersUsedByComponent($html), ['isPanelOpen']))->toBe(['getCalendarLabel']);
});

function distPath(): string
{
    return dirname(__DIR__, 2).'/resources/dist/components/date-time-picker.js';
}

/**
 * Evaluates the built component in node and returns the keys of the object it gives Alpine.
 *
 * @return list<string>
 */
function distComponentKeys(): array
{
    static $keys;

    $script = <<<'JS'
        globalThis.window = globalThis
        const { pathToFileURL } = await import('node:url')
        const component = (await import(pathToFileURL(process.argv[1]).href)).default
        console.log(JSON.stringify(Object.keys(component({ displayFormat: 'D MMM YY', firstDayOfWeek: 1, locale: 'th', state: null }))))
        JS;

    return $keys ??= json_decode(Process::run(['node', '--input-type=module', '-e', $script, distPath()])->throw()->output(), true);
}

/**
 * Identifiers referenced by the Alpine directives inside the component element: everything that must
 * resolve on the component's data, after removing string literals, member accesses, object keys,
 * magics ($el, $refs…), x-for loop variables and JS globals.
 *
 * @return list<string>
 */
function alpineIdentifiersUsedByComponent(string $html): array
{
    $html = substr($html, (int) strpos($html, 'x-data="thaiDateTimePickerFormComponent('));

    preg_match_all('/\s((?:x-(?!data|ref|load|cloak|ignore)|@|:)[\w:.-]*)="([^"]*)"/', $html, $matches, PREG_SET_ORDER);

    $expressions = array_map(fn (array $match): string => html_entity_decode($match[2], ENT_QUOTES | ENT_HTML5), $matches);

    $loopVariables = [];

    foreach ($matches as $index => $match) {
        if (str_starts_with($match[1], 'x-for') && preg_match('/^\s*\(?([^)]*?)\)?\s+(?:in|of)\s+(.+)$/s', $expressions[$index], $loop)) {
            $loopVariables = [...$loopVariables, ...array_map('trim', explode(',', $loop[1]))];
            $expressions[$index] = $loop[2];
        }
    }

    $identifiers = [];

    foreach ($expressions as $expression) {
        $expression = preg_replace('/\'(?:\\\\.|[^\'\\\\])*\'|"(?:\\\\.|[^"\\\\])*"|`(?:\\\\.|[^`\\\\])*`/s', "''", $expression);

        preg_match_all('/(?<![\w$.])[A-Za-z_][\w$]*+(?!\s*:(?!:))/', $expression, $found);

        $identifiers = [...$identifiers, ...$found[0]];
    }

    $globals = ['true', 'false', 'null', 'undefined', 'if', 'else', 'return', 'typeof', 'instanceof', 'new', 'this', 'in', 'of', 'let', 'const', 'window', 'document', 'Math', 'Number', 'String', 'JSON', 'Object', 'Array', 'Date', 'console'];

    return array_values(array_unique(array_diff($identifiers, $loopVariables, $globals)));
}

/**
 * Keys of literal x-data objects in Filament's markup (e.g. the loading wrapper's `{ isLoading: true }`),
 * which are in scope for the component without being part of it.
 *
 * @return list<string>
 */
function alpineDataKeysDeclaredInMarkup(string $html): array
{
    preg_match_all('/x-data="\{([^"]*)\}"/', $html, $objects);

    preg_match_all('/([A-Za-z_$][\w$]*)\s*:/', implode(',', $objects[1]), $keys);

    return $keys[1];
}
