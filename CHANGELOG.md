# Changelog

## 4.1.0 - 2026-10-11

ต้องการ Filament 5.10.1 ขึ้นไป

- `displayFormat()` ใช้ได้แล้ว ปี `Y` / `y` แสดงเป็นปี พ.ศ. ค่าเริ่มต้นยังเป็น `j M y` และ `j M y H:i` เหมือนเดิม
- `ThaiDateTimePicker::make()->date(false)` เป็นช่องเลือกเวลาอย่างเดียว แสดงเฉพาะเวลา
- ปรับ picker ให้ตรงกับ Filament 5.10.1 รวมถึงการตรวจ `minDate()` / `maxDate()` และการจัดการวันที่แบบไม่มีเวลา
- markup ของ picker ใช้ของ Filament โดยตรง แล้วแทนเฉพาะจุดที่เป็นภาษาไทย ไม่ต้องตาม sync Blade view อีก

## 4.0.2 - 2026-10-11

- `timeDescription()` แสดงเวลาตาม timezone ของคอลัมน์ ตรงกับวันที่จาก `thaidate()`
- ไฟล์สำหรับพัฒนา (`composer.lock`, `package-lock.json`, `bin/`, `resources/js`) ไม่ติดไปกับแพ็กเกจที่ติดตั้งแล้ว

## 4.0.1 - 2026-10-11

- รองรับ `phattarachai/thaidate` 14 (ยังใช้ 13 ได้เหมือนเดิม)
- README: ตารางเวอร์ชันบอก Filament, PHP และ Laravel ของแต่ละ major และอธิบาย parameter `format`, `timezone`, `default` กับ `timeDescription()`

## 4.0.0 - 2026-08-11

ต้องการ PHP 8.3 และ Laravel 12 หรือ 13 (Filament 5) ถ้ายังใช้ PHP 8.2 หรือ Laravel 11 ให้ใช้ 3.x

- ตรวจค่าชั่วโมง นาที วินาทีที่กรอกเกินช่วง ตาม time-input validation ของ Filament 5
- macro `thaidate()` ของ Table และ Infolist ลงทะเบียนเฉพาะเมื่อมี `filament/tables` หรือ `filament/infolists` ติดตั้งอยู่ ติดตั้งแค่ `filament/forms` ก็ไม่ error
- ใช้ `phattarachai/thaidate` 13 (Carbon 3)
- เลิก build CSS ที่ไม่ได้ใช้ แพ็กเกจส่งเฉพาะ JS และใช้ class `fi-fo-*` ของ Filament
- เพิ่ม CI (Laravel 12/13, PHPStan level 5, Pint) และย้ายเทสต์ไป Pest 4

## 3.0.1 - 2026-03-24

- แก้ช่องปี พ.ศ. ที่พิมพ์เปลี่ยนปีไม่ได้ (Filament 5)

## 3.0.0 - 2026-03-24

รองรับ Filament 5.x

- ปรับ Blade view ให้ตรงกับ Filament 5 (wire:ignore, wire:key, x-load)
- ปรับ JS component ให้ตรงกับ Filament 5 (init timing, defaultFocusedDate)
- แก้ไขปัญหา DatePicker ใช้งานไม่ได้ใน Modal และ SPA mode
- แก้ไขปัญหาใช้หลาย DatePicker ในฟอร์มเดียวกันแล้ว state ชนกัน
- เพิ่ม `bin/sync-view.php` สำหรับ sync Blade view จาก Filament ต้นฉบับ
- เพิ่ม `SYNC.md` เอกสารอธิบายจุดที่แก้ไขจาก Filament ต้นฉบับ
- เพิ่ม `filament/forms: ^5.0` เป็น dependency ใน composer.json

## 2.2.0 - 2026-03-24

- แก้ช่องปี พ.ศ. ที่พิมพ์เปลี่ยนปีไม่ได้ (Filament 4)

## 2.1.0 - 2026-03-24

แก้ไข bug สำหรับ Filament 4.x

- แก้ไขปัญหา DatePicker ใช้งานไม่ได้ใน Modal และ SPA mode
- แก้ไขปัญหาใช้หลาย DatePicker ในฟอร์มเดียวกันแล้ว state ชนกัน
- ย้าย wire:ignore ไปยัง outer div เพื่อป้องกัน Livewire ทำลาย Alpine state
- ปรับ wire:key ให้ใช้ hash-based เพื่อป้องกัน DOM collision
- แก้ไข init() timing ให้ใช้ $nextTick ป้องกันปัญหาใน modal
- ใช้ dayjs buddhistEra plugin แทนการคำนวณ manual
- เพิ่ม filament/forms: ^4.0 เป็น dependency

## 2.0.0 - 2026-03-24

รองรับ Filament 4.x

## 1.6.1 - 2026-10-04

- แก้ picker พัง (`month is not defined` และเดือนซ้ำเป็น 24 ตัวเลือก) เมื่อฟอร์มแม่ re-render บน Livewire 3.8 (Filament 3)

## 1.0.0 - 2024-05-17

- เปิดตัวเวอร์ชันแรก รองรับ Filament 3.x
