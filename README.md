# FilamentPHP Thai Date Picker Form Component

[![Latest Version on Packagist](https://img.shields.io/packagist/v/phattarachai/filament-thai-date-picker.svg?style=flat-square)](https://packagist.org/packages/phattarachai/filament-thai-date-picker)
[![Total Downloads](https://img.shields.io/packagist/dt/phattarachai/filament-thai-date-picker.svg?style=flat-square)](https://packagist.org/packages/phattarachai/filament-thai-date-picker)

ปฏิทิน Thai Date Picker สำหรับ Filament 3 Form Component
วัน/เดือน/ปีที่แสดงใน Form เป็นภาษาไทย แต่เก็บเข้า Model เป็นปี ค.ศ.ตามปกติ

![Thai Date Picker](thai-date-picker.png)

## วิธีติดตั้ง

Run คำสั่ง composer require เพื่อติดตั้ง Package

```bash
composer require phattarachai/filament-thai-date-picker 
```

ทำการ publish ไฟล์ javascript ถ้าหากไม่ได้ run คำสั่งนี้อยู่แล้วในไฟล์ composer.json "post-autoload-dump"

```bash
php artisan filament:upgrade 
```

## วิธีใช้งาน ThaiDatePicker

ใช้เหมือน DatePicker ปกติ แต่เรียกใช้ class ThaiDatePicker แทน

```php
use Phattarachai/FilamentThaiDatePicker;

ThaiDatePicker::make('order_date')
    ->label('วันที่สั่งซื้อ')
    ->suffixIcon('heroicon-o-calendar')

```

## การแสดงวันที่ภาษาไทยใน Table Column

นอกจาก Datepicker แล้ว package นี้เพิ่ม macro method `thaidate()` สำหรับการ format การแสดงผลวันที่เพื่อให้แสดงผลเป็นปี
พ.ศ. ภาษาไทย ได้เลย

```php
use Filament\Tables;

Tables\Columns\TextColumn::make('order_date')
    ->label('วันที่')
    ->thaidate()
    // สามารถระบุ date format ได้เหมือน function date_format ของ PHP
    // default format เป็น d M y 
    // เช่น 18 พ.ค. 67

```

ถ้าเป็น วันที่และเวลาใช้ method `thaidatetime()`

```php
use Filament\Tables;

Tables\Columns\TextColumn::make('created_at')
    ->label('วันที่สร้าง')
    ->thaidatetime()
    // default format เป็น d M y H:i 
    // เช่น 18 พ.ค. 67 12:00

```

## การแสดงวันที่ภาษาไทยใน Infolist

เช่นเดียวกับ TableColumn ใน package นี้เพิ่ม method `thaidate()` และ `thaidatetime()`
สำหรับช่วยการแสดงผลคอลัมน์วันที่ปี พ.ศ. ภาษาไทย

```php
use Filament\Infolists\Components\TextEntry;

TextEntry::make('order_date')
    ->label('วันที่สั่งซื้อ')
    ->thaidate(),
    // 18 พ.ค. 67
```

```php
use Filament\Infolists\Components\TextEntry;

TextEntry::make('created_at')
    ->label('วันที่สร้าง')
    ->thaidatetime(),
    // 18 พ.ค. 67 12:05
```

## ผู้พัฒนา

🙋‍♂️ สวัสดีครับ ผมอ๊อฟนะครับ เป็น Full Stack Web Developer
รับ Implement งาน Project ทางด้าน Web Application สำหรับองค์กร ธุรกิจ SME ส่วนงานราชการและบริษัทขนาดใหญ่ครับ  
https://phattarachai.dev

line:
[phat-chai](https://line.me/ti/p/~phat-chai)

## License

The MIT License (MIT).
