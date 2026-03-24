# Changelog

## 3.0.0 - 2026-03-24

รองรับ Filament 5.x

- ปรับ Blade view ให้ตรงกับ Filament 5 (wire:ignore, wire:key, x-load)
- ปรับ JS component ให้ตรงกับ Filament 5 (init timing, defaultFocusedDate)
- แก้ไขปัญหา DatePicker ใช้งานไม่ได้ใน Modal และ SPA mode
- แก้ไขปัญหาใช้หลาย DatePicker ในฟอร์มเดียวกันแล้ว state ชนกัน
- เพิ่ม `bin/sync-view.php` สำหรับ sync Blade view จาก Filament ต้นฉบับ
- เพิ่ม `SYNC.md` เอกสารอธิบายจุดที่แก้ไขจาก Filament ต้นฉบับ
- เพิ่ม `filament/forms: ^5.0` เป็น dependency ใน composer.json

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

## 1.0.0 - 2024-05-17

- เปิดตัวเวอร์ชันแรก รองรับ Filament 3.x
