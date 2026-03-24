// Thai DatePicker: based on Filament's date-time-picker.js
// Changes from original marked with "THAI:" comments.

import dayjs from 'dayjs/esm'
import buddhistEra from 'dayjs/plugin/buddhistEra' // THAI: added
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

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
    hasTime,
    isAutofocused,
    locale,
    shouldCloseOnDateSelection,
    state,
}) {
    const timezone = dayjs.tz.guess()

    return {
        daysInFocusedMonth: [],

        displayText: '',

        emptyDaysInFocusedMonth: [],

        focusedDate: null,

        focusedMonth: null,

        focusedYear: null,

        focusedThaiYear: null, // THAI: added

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
                this.focusedDate ??= (
                    this.getDefaultFocusedDate() ?? dayjs()
                ).tz(timezone)
                this.focusedMonth ??= this.focusedDate.month()
                this.focusedYear ??= this.focusedDate.year()
                this.focusedThaiYear ??= this.focusedDate.year() + 543 // THAI: added
            })

            let date =
                this.getSelectedDate() ??
                this.getDefaultFocusedDate() ??
                dayjs().tz(timezone).hour(0).minute(0).second(0)

            if (this.getMaxDate() !== null && date.isAfter(this.getMaxDate())) {
                date = null
            } else if (
                this.getMinDate() !== null &&
                date.isBefore(this.getMinDate())
            ) {
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
                    year = dayjs().tz(timezone).year()

                    this.focusedYear = year
                }

                if (this.focusedDate.year() === year) {
                    return
                }

                this.focusedDate = this.focusedDate.year(year)
            })

            // THAI: added — sync Thai year input → focusedYear
            this.$watch('focusedThaiYear', () => {
                if (this.focusedThaiYear?.length > 4) {
                    this.focusedThaiYear = this.focusedThaiYear.substring(0, 4)
                }

                if (
                    !this.focusedThaiYear ||
                    this.focusedThaiYear?.length !== 4
                ) {
                    return
                }

                let year = +this.focusedThaiYear - 543

                if (!Number.isInteger(year)) {
                    year = dayjs().tz(timezone).year()
                    this.focusedThaiYear = year + 543
                }

                if (this.focusedYear !== year) {
                    this.focusedYear = year
                }
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

                if (
                    this.getMaxDate() !== null &&
                    date?.isAfter(this.getMaxDate())
                ) {
                    date = null
                }
                if (
                    this.getMinDate() !== null &&
                    date?.isBefore(this.getMinDate())
                ) {
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
                        disabledDate = dayjs(disabledDate)

                        if (!disabledDate.isValid()) {
                            return false
                        }

                        return disabledDate.isSame(date, 'day')
                    },
                )
            ) {
                return true
            }

            if (this.getMaxDate() && date.isAfter(this.getMaxDate(), 'day')) {
                return true
            }
            if (this.getMinDate() && date.isBefore(this.getMinDate(), 'day')) {
                return true
            }

            return false
        },

        dayIsDisabled(day) {
            this.focusedDate ??= dayjs().tz(timezone)

            return this.dateIsDisabled(this.focusedDate.date(day))
        },

        dayIsSelected(day) {
            let selectedDate = this.getSelectedDate()

            if (selectedDate === null) {
                return false
            }

            this.focusedDate ??= dayjs().tz(timezone)

            return (
                selectedDate.date() === day &&
                selectedDate.month() === this.focusedDate.month() &&
                selectedDate.year() === this.focusedDate.year()
            )
        },

        dayIsToday(day) {
            let date = dayjs().tz(timezone)
            this.focusedDate ??= date

            return (
                date.date() === day &&
                date.month() === this.focusedDate.month() &&
                date.year() === this.focusedDate.year()
            )
        },

        focusPreviousDay() {
            this.focusedDate ??= dayjs().tz(timezone)

            this.focusedDate = this.focusedDate.subtract(1, 'day')
        },

        focusPreviousWeek() {
            this.focusedDate ??= dayjs().tz(timezone)

            this.focusedDate = this.focusedDate.subtract(1, 'week')
        },

        focusNextDay() {
            this.focusedDate ??= dayjs().tz(timezone)

            this.focusedDate = this.focusedDate.add(1, 'day')
        },

        focusNextWeek() {
            this.focusedDate ??= dayjs().tz(timezone)

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
            let date = dayjs(this.$refs.maxDate?.value)

            return date.isValid() ? date : null
        },

        getMinDate() {
            let date = dayjs(this.$refs.minDate?.value)

            return date.isValid() ? date : null
        },

        getSelectedDate() {
            if (this.state === undefined) {
                return null
            }

            if (this.state === null) {
                return null
            }

            let date = dayjs(this.state)

            if (!date.isValid()) {
                return null
            }

            return date
        },

        getDefaultFocusedDate() {
            if (this.defaultFocusedDate === null) {
                return null
            }

            let defaultFocusedDate = dayjs(this.defaultFocusedDate)

            if (!defaultFocusedDate.isValid()) {
                return null
            }

            return defaultFocusedDate
        },

        togglePanelVisibility() {
            if (!this.isOpen()) {
                this.focusedDate =
                    this.getSelectedDate() ??
                    this.focusedDate ??
                    this.getMinDate() ??
                    dayjs().tz(timezone)

                this.setupDaysGrid()
            }

            this.$refs.panel.toggle(this.$refs.button)
        },

        selectDate(day = null) {
            if (day) {
                this.setFocusedDay(day)
            }

            this.focusedDate ??= dayjs().tz(timezone)

            this.setState(this.focusedDate)

            if (shouldCloseOnDateSelection) {
                this.togglePanelVisibility()
            }
        },

        // THAI: modified — display Buddhist Era format instead of displayFormat
        setDisplayText() {
            const date = this.getSelectedDate()
            if (!date) {
                this.displayText = ''
                return
            }

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
            this.focusedDate ??= dayjs().tz(timezone)

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
            this.focusedDate = (this.focusedDate ?? dayjs().tz(timezone)).date(
                day,
            )
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

            this.state = date
                .hour(this.hour ?? 0)
                .minute(this.minute ?? 0)
                .second(this.second ?? 0)
                .format('YYYY-MM-DD HH:mm:ss')

            this.setDisplayText()
        },

        isOpen() {
            return this.$refs.panel?.style.display === 'block'
        },
    }
}

const locales = {
    en: require('dayjs/locale/en'),
    th: require('dayjs/locale/th'),
}
