// Thai DatePicker: based on Filament's date-time-picker.js (filament/forms v5.10.1)
// Changes from original marked with "THAI:" comments. How to re-sync: see SYNC.md.

import dayjs from 'dayjs/esm'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import buddhistEra from 'dayjs/plugin/buddhistEra' // THAI: added
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(advancedFormat)
dayjs.extend(buddhistEra) // THAI: added
dayjs.extend(customParseFormat)
dayjs.extend(localeData)
dayjs.extend(timezone)
dayjs.extend(utc)

window.dayjs = dayjs

// THAI: renamed from dateTimePickerFormComponent, added hasTime param
export default function thaiDateTimePickerFormComponent({
    defaultFocusedDate,
    displayFormat,
    firstDayOfWeek,
    hasDate = true,
    hasTime, // THAI: added
    isAutofocused,
    locale,
    shouldCloseOnDateSelection,
    state,
}) {
    return {
        daysInFocusedMonth: [],

        displayText: '',

        emptyDaysInFocusedMonth: [],

        focusedDate: null,

        focusedMonth: null,

        focusedYear: null,

        focusedThaiYear: null, // THAI: added

        hasValidationMessage: false,

        hour: null,

        isClearingState: false,

        minute: null,

        second: null,

        state,

        defaultFocusedDate,

        dayLabels: [],

        months: [],

        init() {
            dayjs.locale(locales[locale] ?? locales['th']) // THAI: default 'th'

            this.$nextTick(() => {
                const date = this.getDefaultFocusedDate()
                this.focusedDate ??= hasDate
                    ? (date ?? this.getToday())
                    : (date ?? dayjs()).tz(dayjs.tz.guess())
                this.focusedMonth ??= this.focusedDate.month()
                this.focusedYear ??= this.focusedDate.year()
                this.focusedThaiYear ??= this.focusedDate.year() + 543 // THAI: added
            })

            let date =
                this.getSelectedDate() ??
                this.getDefaultFocusedDate() ??
                this.getToday().hour(0).minute(0).second(0)

            if (this.dateIsOutsideLimits(date)) {
                date = null
            }

            this.hour = date?.hour() ?? 0
            this.minute = date?.minute() ?? 0
            this.second = date?.second() ?? 0

            this.setDisplayText()
            this.setMonths()
            this.setDayLabels()

            if (isAutofocused) {
                this.$nextTick(() =>
                    this.togglePanelVisibility(this.$refs.button),
                )
            }

            this.$watch('focusedMonth', () => {
                this.focusedMonth = +this.focusedMonth

                if (this.focusedDate.month() === this.focusedMonth) {
                    return
                }

                this.focusedDate = this.focusedDate.month(this.focusedMonth)
            })

            this.$watch('focusedYear', () => {
                if (this.focusedYear?.length > 4) {
                    this.focusedYear = this.focusedYear.substring(0, 4)
                }

                if (!this.focusedYear || this.focusedYear?.length !== 4) {
                    return
                }

                let year = +this.focusedYear

                if (!Number.isInteger(year)) {
                    year = this.getToday().year()

                    this.focusedYear = year
                }

                if (this.focusedDate.year() === year) {
                    return
                }

                this.focusedDate = this.focusedDate.year(year)
            })

            // THAI: added — sync Thai year input → focusedDate directly
            this.$watch('focusedThaiYear', () => {
                let thaiYear = +this.focusedThaiYear

                if (
                    !Number.isInteger(thaiYear) ||
                    thaiYear < 1000 ||
                    thaiYear > 9999
                ) {
                    return
                }

                let year = thaiYear - 543

                if (this.focusedDate.year() === year) {
                    return
                }

                this.focusedDate = this.focusedDate.year(year)
            })

            this.$watch('focusedDate', () => {
                let month = this.focusedDate.month()
                let year = this.focusedDate.year()

                if (this.focusedMonth !== month) {
                    this.focusedMonth = month
                }

                if (this.focusedYear !== year) {
                    this.focusedYear = year
                }

                // THAI: added — keep Thai year in sync
                let thaiYear = year + 543
                if (this.focusedThaiYear !== thaiYear) {
                    this.focusedThaiYear = thaiYear
                }

                this.setupDaysGrid()
            })

            this.$watch('hour', () => {
                let hour = +this.hour

                if (!Number.isInteger(hour)) {
                    this.hour = 0
                } else if (hour > 23) {
                    this.hour = 0
                } else if (hour < 0) {
                    this.hour = 23
                } else {
                    this.hour = hour
                }

                if (this.isClearingState) {
                    return
                }

                let date = this.getSelectedDate() ?? this.focusedDate

                this.setState(date.hour(this.hour ?? 0))
            })

            this.$watch('minute', () => {
                let minute = +this.minute

                if (!Number.isInteger(minute)) {
                    this.minute = 0
                } else if (minute > 59) {
                    this.minute = 0
                } else if (minute < 0) {
                    this.minute = 59
                } else {
                    this.minute = minute
                }

                if (this.isClearingState) {
                    return
                }

                let date = this.getSelectedDate() ?? this.focusedDate

                this.setState(date.minute(this.minute ?? 0))
            })

            this.$watch('second', () => {
                let second = +this.second

                if (!Number.isInteger(second)) {
                    this.second = 0
                } else if (second > 59) {
                    this.second = 0
                } else if (second < 0) {
                    this.second = 59
                } else {
                    this.second = second
                }

                if (this.isClearingState) {
                    return
                }

                let date = this.getSelectedDate() ?? this.focusedDate

                this.setState(date.second(this.second ?? 0))
            })

            this.$watch('state', () => {
                if (this.state === undefined) {
                    return
                }

                let date = this.getSelectedDate()

                if (date === null) {
                    this.clearState()

                    return
                }

                if (this.dateIsOutsideLimits(date)) {
                    date = null
                }

                const newHour = date?.hour() ?? 0
                if (this.hour !== newHour) {
                    this.hour = newHour
                }

                const newMinute = date?.minute() ?? 0
                if (this.minute !== newMinute) {
                    this.minute = newMinute
                }

                const newSecond = date?.second() ?? 0
                if (this.second !== newSecond) {
                    this.second = newSecond
                }

                this.setDisplayText()
            })
        },

        checkTimeInputValidity(event) {
            const el = event.target
            if (this.isOpen() && !el.validity.valid) {
                el.reportValidity()
            }
        },

        clearState() {
            this.isClearingState = true

            this.setState(null)

            this.hour = 0
            this.minute = 0
            this.second = 0

            this.$nextTick(() => (this.isClearingState = false))
        },

        dateIsDisabled(date) {
            if (
                this.$refs?.disabledDates &&
                JSON.parse(this.$refs.disabledDates.value ?? []).some(
                    (disabledDate) => {
                        // Preserve browser-calendar projection for explicitly zoned and other non-canonical values.
                        disabledDate = !hasDate
                            ? dayjs(disabledDate)
                            : typeof disabledDate === 'string' &&
                                /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?)?$/.test(
                                    disabledDate,
                                )
                              ? dayjs.utc(disabledDate)
                              : dayjs.utc(
                                    dayjs(disabledDate).format('YYYY-MM-DD'),
                                )

                        if (!disabledDate.isValid()) {
                            return false
                        }

                        return disabledDate.isSame(date, 'day')
                    },
                )
            ) {
                return true
            }

            if (
                hasDate &&
                this.getMaxDate() &&
                date.isAfter(this.getMaxDate(), 'day')
            ) {
                return true
            }
            if (
                hasDate &&
                this.getMinDate() &&
                date.isBefore(this.getMinDate(), 'day')
            ) {
                return true
            }

            return false
        },

        dayIsDisabled(day) {
            this.focusedDate ??= this.getToday()

            return this.dateIsDisabled(this.focusedDate.date(day))
        },

        dayIsSelected(day) {
            let selectedDate = this.getSelectedDate()

            if (selectedDate === null) {
                return false
            }

            this.focusedDate ??= this.getToday()

            return (
                selectedDate.date() === day &&
                selectedDate.month() === this.focusedDate.month() &&
                selectedDate.year() === this.focusedDate.year()
            )
        },

        dayIsToday(day) {
            let date = this.getToday()
            this.focusedDate ??= date

            return (
                date.date() === day &&
                date.month() === this.focusedDate.month() &&
                date.year() === this.focusedDate.year()
            )
        },

        focusPreviousDay() {
            this.focusedDate ??= this.getToday()

            this.focusedDate = this.focusedDate.subtract(1, 'day')
        },

        focusPreviousWeek() {
            this.focusedDate ??= this.getToday()

            this.focusedDate = this.focusedDate.subtract(1, 'week')
        },

        focusNextDay() {
            this.focusedDate ??= this.getToday()

            this.focusedDate = this.focusedDate.add(1, 'day')
        },

        focusNextWeek() {
            this.focusedDate ??= this.getToday()

            this.focusedDate = this.focusedDate.add(1, 'week')
        },

        getDayLabels() {
            const labels = dayjs.weekdaysShort()

            if (firstDayOfWeek === 0) {
                return labels
            }

            return [
                ...labels.slice(firstDayOfWeek),
                ...labels.slice(0, firstDayOfWeek),
            ]
        },

        getMaxDate() {
            return this.getDateLimit(this.$refs.maxDate?.value)
        },

        getMinDate() {
            return this.getDateLimit(this.$refs.minDate?.value)
        },

        getDateLimit(value) {
            const date = dayjs.utc(value)

            return date.isValid() ? date : null
        },

        dateIsOutsideLimits(date) {
            const minimum = this.getMinDate()
            const maximum = this.getMaxDate()

            return (
                (minimum !== null &&
                    (hasDate
                        ? date.isBefore(minimum)
                        : date.format('HH:mm:ss') <
                          minimum.format('HH:mm:ss'))) ||
                (maximum !== null &&
                    (hasDate
                        ? date.isAfter(maximum)
                        : date.format('HH:mm:ss') > maximum.format('HH:mm:ss')))
            )
        },

        getSelectedDate() {
            if (this.state === undefined) {
                return null
            }

            if (this.state === null) {
                return null
            }

            let date = dayjs.utc(this.state)

            if (!date.isValid()) {
                return null
            }

            return date
        },

        getDefaultFocusedDate() {
            if (this.defaultFocusedDate === null) {
                return null
            }

            let defaultFocusedDate = dayjs.utc(this.defaultFocusedDate)

            if (!defaultFocusedDate.isValid()) {
                return null
            }

            return defaultFocusedDate
        },

        getToday() {
            // Use UTC only as a neutral calendar, preserving the browser's local date.
            return hasDate
                ? dayjs.utc(dayjs().format('YYYY-MM-DD'))
                : dayjs().tz(dayjs.tz.guess())
        },

        togglePanelVisibility() {
            if (!this.isOpen()) {
                this.focusedDate =
                    this.getSelectedDate() ??
                    this.focusedDate ??
                    this.getMinDate() ??
                    this.getToday()

                this.setupDaysGrid()
            }

            this.$refs.panel.toggle(this.$refs.button)
        },

        selectDate(day = null) {
            if (day) {
                this.setFocusedDay(day)
            }

            this.focusedDate ??= this.getToday()

            this.setState(this.focusedDate)

            if (shouldCloseOnDateSelection) {
                this.togglePanelVisibility()
            }
        },

        setDisplayText() {
            const date = this.getSelectedDate()

            if (!date) {
                this.displayText = ''

                return
            }

            if (!hasDate) {
                this.displayText = date.format(displayFormat)

                return
            }

            // THAI: modified — display Buddhist Era format instead of displayFormat
            this.displayText = hasTime
                ? date.format('D MMM BB HH:mm')
                : date.format('D MMM BB')
        },

        setMonths() {
            this.months = dayjs.months()
        },

        setDayLabels() {
            this.dayLabels = this.getDayLabels()
        },

        setupDaysGrid() {
            this.focusedDate ??= this.getToday()

            this.emptyDaysInFocusedMonth = Array.from(
                {
                    length: this.focusedDate.date(8 - firstDayOfWeek).day(),
                },
                (_, i) => i + 1,
            )

            this.daysInFocusedMonth = Array.from(
                {
                    length: this.focusedDate.daysInMonth(),
                },
                (_, i) => i + 1,
            )
        },

        setFocusedDay(day) {
            this.focusedDate = (this.focusedDate ?? this.getToday()).date(day)
        },

        setState(date) {
            if (date === null) {
                this.state = null
                this.setDisplayText()

                return
            }

            if (this.dateIsDisabled(date)) {
                return
            }

            if (!hasDate) {
                date = dayjs.utc(date.format('YYYY-MM-DD HH:mm:ss'))
            }

            this.state = date
                .hour(this.hour ?? 0)
                .minute(this.minute ?? 0)
                .second(this.second ?? 0)
                .format('YYYY-MM-DD HH:mm:ss')

            this.setDisplayText()
        },

        timeInputInvalid(event) {
            const el = event.target

            if (!this.isOpen()) {
                event.preventDefault()
                this.togglePanelVisibility()
            }

            if (!this.hasValidationMessage) {
                this.hasValidationMessage = true

                this.$nextTick(() => {
                    el.reportValidity()
                    this.hasValidationMessage = false
                })
            }
        },

        isOpen() {
            return this.$refs.panel?.style.display === 'block'
        },
    }
}

// THAI: reduced to en + th
const locales = {
    en: require('dayjs/locale/en'),
    th: require('dayjs/locale/th'),
}
