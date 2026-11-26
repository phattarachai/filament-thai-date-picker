// Thai DatePicker: based on Filament's date-time-picker.js (filament/forms v5.12.0)
// Changes from original marked with "THAI:" comments. How to re-sync: see SYNC.md.

import dayjs from 'dayjs/esm'
import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
} from '@floating-ui/dom'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import buddhistEra from 'dayjs/plugin/buddhistEra' // THAI: added
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import {
    observeFieldAccessibility,
    setFieldAccessibilityAttributes,
} from '../utilities/field-accessibility.js' // THAI: copied from filament/forms

dayjs.extend(advancedFormat)
dayjs.extend(buddhistEra) // THAI: added
dayjs.extend(customParseFormat)
dayjs.extend(localeData)
dayjs.extend(timezone)
dayjs.extend(utc)

window.dayjs = dayjs

// THAI: renamed from dateTimePickerFormComponent
export default function thaiDateTimePickerFormComponent({
    defaultFocusedDate,
    displayFormat,
    firstDayOfWeek,
    hasDate = true,
    isAutofocused,
    locale,
    shouldCloseOnDateSelection,
    state,
}) {
    // THAI: added — show years in the display format as Buddhist Era (YYYY → BBBB, YY → BB)
    displayFormat = displayFormat?.replace(/\[[^\]]+]|YYYY|YY/g, (token) =>
        token.startsWith('[') ? token : token === 'YYYY' ? 'BBBB' : 'BB',
    )

    const calendarLocale = (locales[locale] ?? locales['th']).name // THAI: default 'th'

    return {
        weeksInFocusedMonth: [],

        displayText: '',

        renderedMonth: null,

        isPanelOpen: false,

        isPanelReady: false,

        isDestroyed: false,

        panelGeneration: 0,

        focusGeneration: 0,

        positionGeneration: 0,

        positioningCleanup: null,

        accessibilityObserver: null,

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

        fullDayLabels: [],

        months: [],

        init() {
            dayjs.locale(locales[locale] ?? locales['th']) // THAI: default 'th'

            this.$nextTick(() => {
                if (this.isDestroyed) {
                    return
                }

                const date = this.getDefaultFocusedDate()
                this.focusedDate ??= hasDate
                    ? (date ?? this.getToday()).locale(calendarLocale)
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

            this.accessibilityObserver = observeFieldAccessibility(
                this.$el,
                (attributes) =>
                    setFieldAccessibilityAttributes(
                        this.$refs.button,
                        attributes,
                    ),
            )

            if (isAutofocused) {
                this.$nextTick(() => {
                    if (!this.isDestroyed) {
                        this.togglePanelVisibility()
                    }
                })
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
                const shouldFocusCalendar =
                    hasDate &&
                    this.$refs.calendar?.contains(document.activeElement)
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

                if (shouldFocusCalendar) {
                    this.focusCalendarDate()
                }
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

            this.$dispatch('async-component-ready')
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

        handleTriggerKeydown(event) {
            if (
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                ![
                    'Enter',
                    ' ',
                    'ArrowLeft',
                    'ArrowRight',
                    'ArrowUp',
                    'ArrowDown',
                ].includes(event.key)
            ) {
                return
            }

            event.preventDefault()
            event.stopPropagation()

            if (this.isOpen()) {
                this.focusCalendarDate()
            } else {
                this.togglePanelVisibility()
            }
        },

        handleFocusOut(event) {
            const generation = this.panelGeneration

            if (
                event.relatedTarget &&
                !this.$refs.calendar?.contains(event.relatedTarget)
            ) {
                this.focusGeneration++
            }

            const focusGeneration = this.focusGeneration

            this.$nextTick(() =>
                requestAnimationFrame(() => {
                    if (
                        !this.isDestroyed &&
                        generation === this.panelGeneration &&
                        focusGeneration === this.focusGeneration &&
                        this.isOpen() &&
                        !this.$el.contains(document.activeElement)
                    ) {
                        this.closePanel()
                    }
                }),
            )
        },

        handleCalendarKeydown(event) {
            if (event.altKey || event.ctrlKey || event.metaKey) {
                return
            }

            const isRtl =
                getComputedStyle(this.$refs.calendar).direction === 'rtl'
            const weekDay = (this.focusedDate.day() - firstDayOfWeek + 7) % 7
            let focusedDate = this.focusedDate

            switch (event.key) {
                case 'ArrowLeft':
                    focusedDate = focusedDate.add(isRtl ? 1 : -1, 'day')
                    break
                case 'ArrowRight':
                    focusedDate = focusedDate.add(isRtl ? -1 : 1, 'day')
                    break
                case 'ArrowUp':
                    focusedDate = focusedDate.subtract(7, 'day')
                    break
                case 'ArrowDown':
                    focusedDate = focusedDate.add(7, 'day')
                    break
                case 'Home':
                    focusedDate = focusedDate.subtract(weekDay, 'day')
                    break
                case 'End':
                    focusedDate = focusedDate.add(6 - weekDay, 'day')
                    break
                case 'PageUp':
                case 'PageDown':
                    focusedDate = focusedDate.add(
                        event.key === 'PageUp' ? -1 : 1,
                        event.shiftKey ? 'year' : 'month',
                    )
                    break
                case 'Enter':
                case ' ':
                    this.selectDate()
                    event.preventDefault()
                    event.stopPropagation()

                    return
                case 'Tab':
                    this.$refs.calendar
                        .querySelector(
                            `[data-date="${this.focusedDate.format('YYYY-MM-DD')}"]`,
                        )
                        ?.focus({ preventScroll: true })

                    return
                default:
                    return
            }

            event.preventDefault()
            event.stopPropagation()

            if (this.renderedMonth !== focusedDate.format('YYYY-MM')) {
                // Keep keyboard events in the grid while Alpine replaces the focused row.
                this.$refs.calendar.focus({ preventScroll: true })
            }

            this.focusedDate = focusedDate
            this.focusCalendarDate()
        },

        focusCalendarDate(generation = ++this.focusGeneration) {
            const focusDate = () => {
                if (
                    this.isDestroyed ||
                    !this.$el.isConnected ||
                    !this.isOpen() ||
                    generation !== this.focusGeneration
                ) {
                    return
                }

                this.$refs.calendar
                    ?.querySelector(
                        `[data-date="${this.focusedDate.format('YYYY-MM-DD')}"]`,
                    )
                    ?.focus({ preventScroll: true })
            }

            this.$nextTick(() =>
                this.isPanelReady
                    ? focusDate()
                    : requestAnimationFrame(focusDate),
            )
        },

        getCalendarLabel() {
            return (
                // THAI: Buddhist Era year (BBBB instead of YYYY)
                this.focusedDate?.locale(calendarLocale).format('MMMM BBBB') ??
                ''
            )
        },

        getDayLabel(day) {
            return this.focusedDate
                .date(day)
                .locale(calendarLocale)
                .format('dddd, D MMMM BBBB') // THAI: Buddhist Era year
        },

        getDayLabels() {
            const labels = dayjs()
                .locale(calendarLocale)
                .localeData()
                .weekdaysShort()

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

            if (hasDate) {
                date = date.locale(calendarLocale)
            }

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

            if (hasDate) {
                defaultFocusedDate = defaultFocusedDate.locale(calendarLocale)
            }

            if (!defaultFocusedDate.isValid()) {
                return null
            }

            return defaultFocusedDate
        },

        getToday() {
            // Use UTC only as a neutral calendar, preserving the browser's local date.
            return hasDate
                ? dayjs.utc(dayjs().format('YYYY-MM-DD')).locale(calendarLocale)
                : dayjs().tz(dayjs.tz.guess())
        },

        togglePanelVisibility(shouldFocusCalendar = true) {
            if (this.isDestroyed) {
                return
            }

            if (hasDate && this.isOpen()) {
                this.closePanel(true)

                return
            }

            if (!this.isOpen()) {
                this.focusedDate =
                    this.getSelectedDate() ??
                    this.focusedDate ??
                    this.getMinDate() ??
                    this.getToday()

                this.setupDaysGrid()
            }

            if (!hasDate) {
                this.$refs.panel.toggle(this.$refs.button)

                return
            }

            this.isPanelOpen = true
            const generation = ++this.panelGeneration
            const focusGeneration = ++this.focusGeneration

            this.$nextTick(() =>
                requestAnimationFrame(() => {
                    if (
                        this.isDestroyed ||
                        !this.$el.isConnected ||
                        !this.isOpen() ||
                        generation !== this.panelGeneration
                    ) {
                        return
                    }

                    this.isPanelReady = true
                    this.positioningCleanup = autoUpdate(
                        this.$refs.button,
                        this.$refs.panel,
                        () => {
                            const positionGeneration = ++this.positionGeneration

                            computePosition(
                                this.$refs.button,
                                this.$refs.panel,
                                {
                                    placement: 'bottom-start',
                                    middleware: [offset(8), flip(), shift()],
                                },
                            ).then(({ x, y }) => {
                                if (
                                    this.isDestroyed ||
                                    !this.$el.isConnected ||
                                    !this.isOpen() ||
                                    generation !== this.panelGeneration ||
                                    positionGeneration !==
                                        this.positionGeneration
                                ) {
                                    return
                                }

                                Object.assign(this.$refs.panel.style, {
                                    left: `${x}px`,
                                    top: `${y}px`,
                                })
                            })
                        },
                    )

                    if (
                        shouldFocusCalendar &&
                        focusGeneration === this.focusGeneration
                    ) {
                        this.focusCalendarDate(focusGeneration)
                    }
                }),
            )
        },

        closePanel(shouldRestoreFocus = false) {
            if (!hasDate) {
                this.$refs.panel.close()
            } else {
                this.isPanelOpen = false
                this.isPanelReady = false
                this.panelGeneration++
                this.focusGeneration++
                this.positioningCleanup?.()
                this.positioningCleanup = null
            }

            if (
                shouldRestoreFocus &&
                !this.isDestroyed &&
                this.$refs.button.isConnected
            ) {
                this.$refs.button.focus({ preventScroll: true })
            }
        },

        selectDate(day = null) {
            if (day) {
                this.setFocusedDay(day)
            }

            this.focusedDate ??= this.getToday()

            if (hasDate && this.dateIsDisabled(this.focusedDate)) {
                return
            }

            this.setState(this.focusedDate)

            if (shouldCloseOnDateSelection) {
                if (hasDate) {
                    this.closePanel(true)
                } else {
                    this.togglePanelVisibility()
                }
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

            // Keep browser-based zone and epoch tokens without letting them normalize calendar components.
            const browserDate = dayjs(this.state)
            const format = (displayFormat || 'YYYY-MM-DDTHH:mm:ssZ').replace(
                /\[[^\]]+]|ZZ|Z|zzz|z|X|x/g,
                (token) =>
                    token.startsWith('[')
                        ? token
                        : `[${browserDate.format(token)}]`,
            )

            this.displayText = date.format(format)
        },

        setMonths() {
            this.months = dayjs().locale(calendarLocale).localeData().months()
        },

        setDayLabels() {
            this.dayLabels = this.getDayLabels()
            const labels = dayjs()
                .locale(calendarLocale)
                .localeData()
                .weekdays()
            this.fullDayLabels = [
                ...labels.slice(firstDayOfWeek % 7),
                ...labels.slice(0, firstDayOfWeek % 7),
            ]
        },

        setupDaysGrid() {
            this.focusedDate ??= this.getToday()

            const month = this.focusedDate.format('YYYY-MM')

            if (this.renderedMonth === month) {
                return
            }

            this.renderedMonth = month
            const emptyDays =
                (this.focusedDate.startOf('month').day() - firstDayOfWeek + 7) %
                7
            const daysInMonth = this.focusedDate.daysInMonth()

            this.weeksInFocusedMonth = Array.from(
                { length: Math.ceil((emptyDays + daysInMonth) / 7) },
                (_, week) =>
                    Array.from({ length: 7 }, (_, column) => {
                        const day = week * 7 + column - emptyDays + 1

                        return day > 0 && day <= daysInMonth ? day : null
                    }),
            )
        },

        setFocusedDay(day) {
            if (this.focusedDate?.date() === day) {
                return
            }

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
            const input = event.target

            if (!this.isOpen()) {
                event.preventDefault()
                this.togglePanelVisibility(false)
            }

            if (hasDate && !this.isPanelReady) {
                event.preventDefault()
            }

            if (!this.hasValidationMessage) {
                this.hasValidationMessage = true
                const generation = this.panelGeneration

                const reportValidity = () => {
                    if (
                        !hasDate ||
                        (!this.isDestroyed &&
                            input.isConnected &&
                            this.isOpen() &&
                            generation === this.panelGeneration)
                    ) {
                        input.reportValidity()
                    }
                    this.hasValidationMessage = false
                }

                this.$nextTick(() =>
                    hasDate
                        ? requestAnimationFrame(reportValidity)
                        : reportValidity(),
                )
            }
        },

        isOpen() {
            return hasDate
                ? this.isPanelOpen
                : this.$refs.panel?.style.display === 'block'
        },

        destroy() {
            this.isDestroyed = true
            this.accessibilityObserver?.disconnect()

            if (hasDate) {
                this.closePanel()
            }
        },
    }
}

// THAI: reduced to en + th
const locales = {
    en: require('dayjs/locale/en'),
    th: require('dayjs/locale/th'),
}
