# FilamentPHP Thai Date Picker Form Component

[![Latest Version on Packagist](https://img.shields.io/packagist/v/phattarachai/filamentphp-thai-date-picker.svg?style=flat-square)](https://packagist.org/packages/phattarachai/filamentphp-thai-date-picker)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/phattarachai/filamentphp-thai-date-picker/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/phattarachai/filamentphp-thai-date-picker/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/phattarachai/filamentphp-thai-date-picker/fix-php-code-styling.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/phattarachai/filamentphp-thai-date-picker/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/phattarachai/filamentphp-thai-date-picker.svg?style=flat-square)](https://packagist.org/packages/phattarachai/filamentphp-thai-date-picker)

ปฏิทิน Thai Date Picker สำหรับ Filament 3 Form Component
วัน/เดือน/ปีที่แสดงใน Form เป็นภาษาไทย แต่เก็บเข้า Model เป็นปี ค.ศ.ตามปกติ

![Thai Date Picker](thai-date-picker.png)

## วิธีติดตั้ง

publish

## วิธีใช้งาน

ใช้เหมือน DatePicker ปกติ แต่เรียกใช้ class ThaiDatePicker แทน

```php
use Phattarachai/FilamentphpThaiDatePicker;

ThaiDatePicker::make('order_date')
    ->label('วันที่สั่งซื้อ')
    ->suffixIcon('heroicon-o-calendar')

```

## ผู้พัฒนา

https://phattarachai.dev

## License

The MIT License (MIT).
