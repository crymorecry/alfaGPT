import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { CalendarIcon } from 'lucide-react'
import { ru } from 'date-fns/locale'

interface DateInputProps {
  value?: Date
  onChange: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  onError?: (hasError: boolean) => void
  showCalendar?: boolean
  calendarPosition?: 'top' | 'bottom'
  minDate?: Date
}

interface DateParts {
  day: string
  month: string
  year: string
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  disabled = false,
  className = "",
  error = false,
  onError,
  showCalendar = true,
  calendarPosition = 'bottom',
  minDate
}) => {
  const [date, setDate] = useState<DateParts>(() => {
    if (value && !isNaN(value.getTime())) {
      return {
        day: value.getDate().toString().padStart(2, '0'),
        month: (value.getMonth() + 1).toString().padStart(2, '0'),
        year: value.getFullYear().toString()
      }
    }
    return { day: '', month: '', year: '' }
  })

  const [isValid, setIsValid] = useState(true)
  const [focusedField, setFocusedField] = useState<keyof DateParts | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  const refs = { month: monthRef, day: dayRef, year: yearRef }

  useEffect(() => {
    if (value && !isNaN(value.getTime())) {
      const newDate = {
        day: value.getDate().toString().padStart(2, '0'),
        month: (value.getMonth() + 1).toString().padStart(2, '0'),
        year: value.getFullYear().toString()
      }
      setDate(newDate)
      setIsValid(true)
    } else if (value === null || value === undefined) {
      setDate({ day: '', month: '', year: '' })
      setIsValid(true)
    }
  }, [value])

  const validateDate = useCallback((dateParts: DateParts): boolean => {
    const { day, month, year } = dateParts

    if (!day || !month || !year) return true

    const dayNum = parseInt(day, 10)
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return false
    if (monthNum < 1 || monthNum > 12) return false
    if (yearNum < 1000 || yearNum > 9999) return false

    const testDate = new Date(yearNum, monthNum - 1, dayNum)
    const isValidDate = testDate.getFullYear() === yearNum &&
      testDate.getMonth() === monthNum - 1 &&
      testDate.getDate() === dayNum

    if (!isValidDate) return false

    if (minDate) {
      const minDateNormalized = new Date(minDate)
      minDateNormalized.setHours(0, 0, 0, 0)
      testDate.setHours(0, 0, 0, 0)
      return testDate >= minDateNormalized
    }
    
    return true
  }, [minDate])

  const updateValidityAndNotify = useCallback((newDate: DateParts) => {
    const valid = validateDate(newDate)
    setIsValid(valid)
    onError?.(!valid)

    if (valid && newDate.day && newDate.month && newDate.year) {
      const dateObj = new Date(
        parseInt(newDate.year, 10),
        parseInt(newDate.month, 10) - 1,
        parseInt(newDate.day, 10)
      )
      onChange(dateObj)
    } else if (!newDate.day || !newDate.month || !newDate.year) {
      onChange(null)
    }
  }, [validateDate, onChange, onError])

  const handleInputChange = (field: keyof DateParts) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')

    if (field === 'month' && value.length > 2) value = value.slice(0, 2)
    if (field === 'day' && value.length > 2) value = value.slice(0, 2)
    if (field === 'year' && value.length > 4) value = value.slice(0, 4)

    if (value.length === 1 && (field === 'month' || field === 'day')) {
      const num = parseInt(value, 10)
      if (field === 'month' && num > 1) {
        value = value.padStart(2, '0')
      } else if (field === 'day' && num > 3) {
        value = value.padStart(2, '0')
      }
    }

    const newDate = { ...date, [field]: value }
    setDate(newDate)
    updateValidityAndNotify(newDate)
  }

  const handleFocus = (field: keyof DateParts) => () => {
    setFocusedField(field)
    if (refs[field].current) {
      refs[field].current?.select()
    }
  }

  const handleBlur = (field: keyof DateParts) => () => {
    setFocusedField(null)

    const currentValue = date[field]
    if (currentValue && currentValue.length === 1) {
      const paddedValue = currentValue.padStart(2, '0')
      const newDate = { ...date, [field]: paddedValue }
      setDate(newDate)
      updateValidityAndNotify(newDate)
    }
  }

  const handleKeyDown = (field: keyof DateParts) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Delete', 'Tab', 'Enter', 'Escape'].includes(e.key)) {
      return
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (field === 'month') dayRef.current?.focus()
        if (field === 'day') yearRef.current?.focus()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (field === 'day') monthRef.current?.focus()
        if (field === 'year') dayRef.current?.focus()
      }
      return
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
      return
    }

    const currentValue = e.currentTarget.value
    if (field === 'month' && currentValue.length === 1 && parseInt(currentValue + e.key) > 12) {
      e.preventDefault()
      const newDate = { ...date, month: e.key, day: '' }
      setDate(newDate)
      dayRef.current?.focus()
      updateValidityAndNotify(newDate)
    } else if (field === 'day' && currentValue.length === 1 && parseInt(currentValue + e.key) > 31) {
      e.preventDefault()
      const newDate = { ...date, day: e.key, year: '' }
      setDate(newDate)
      yearRef.current?.focus()
      updateValidityAndNotify(newDate)
    } else if (field === 'month' && currentValue.length === 1) {
      setTimeout(() => {
        if (date.month.length === 1) {
          dayRef.current?.focus()
        }
      }, 0)
    } else if (field === 'day' && currentValue.length === 1) {
      setTimeout(() => {
        if (date.day.length === 1) {
          yearRef.current?.focus()
        }
      }, 0)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '')

    if (pastedText.length >= 6) {
      const month = pastedText.slice(0, 2)
      const day = pastedText.slice(2, 4)
      const year = pastedText.slice(4, 8)

      const newDate = { month, day, year }
      setDate(newDate)
      updateValidityAndNotify(newDate)
      yearRef.current?.focus()
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = {
        day: selectedDate.getDate().toString().padStart(2, '0'),
        month: (selectedDate.getMonth() + 1).toString().padStart(2, '0'),
        year: selectedDate.getFullYear().toString()
      }
      setDate(newDate)
      updateValidityAndNotify(newDate)
      setIsCalendarOpen(false)
    }
  }

  const getInputClassName = (field: keyof DateParts) => {
    const baseClasses = "w-full text-center bg-transparent border-none outline-none text-sm"
    const focusClasses = focusedField === field ? "ring-2 ring-blue-500 ring-opacity-50" : ""
    const errorClasses = !isValid ? "text-red-500" : ""
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

    return `${baseClasses} ${focusClasses} ${errorClasses} ${disabledClasses}`.trim()
  }

  const getErrorMessage = () => {
    if (!isValid && date.day && date.month && date.year) {
      const dayNum = parseInt(date.day, 10)
      const monthNum = parseInt(date.month, 10)
      const yearNum = parseInt(date.year, 10)
      
      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum) && minDate) {
        const testDate = new Date(yearNum, monthNum - 1, dayNum)
        const minDateNormalized = new Date(minDate)
        minDateNormalized.setHours(0, 0, 0, 0)
        testDate.setHours(0, 0, 0, 0)
        
        if (testDate < minDateNormalized) {
          return "Нельзя выбрать дату раньше минимальной"
        }
      }
    }
    return "Неверная дата"
  }

  const inputContainer = (
    <div className="w-full">
      <div className={`
        flex items-center border rounded-lg px-3 py-1.5 bg-white justify-between
        ${error || !isValid ? 'border-red-500' : 'border-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        ${focusedField ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}
        ${className}
      `.trim()}>
        <div className="flex items-center">
          <span className="text-base text-zinc-800 dark:text-zinc-200">{date.day}.{date.month}.{date.year}</span>
        </div>
        {showCalendar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-2 p-1 h-auto w-auto hover:bg-gray-100"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            disabled={disabled}
            aria-label="Открыть календарь"
          >
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>
      {!isValid && (date.day || date.month || date.year) && (
        <p className="text-red-500 text-xs mt-1 ml-1">
          {getErrorMessage()}
        </p>
      )}
    </div>
  )

  if (!showCalendar) {
    return inputContainer
  }

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        {inputContainer}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[99999]"
        align="start"
        side={calendarPosition}
      >
        <Calendar
          locale={ru}
          mode="single"
          selected={value}
          onSelect={handleCalendarSelect}
          disabled={minDate ? (date) => {
            const minDateNormalized = new Date(minDate)
            minDateNormalized.setHours(0, 0, 0, 0)
            const dateNormalized = new Date(date)
            dateNormalized.setHours(0, 0, 0, 0)
            return dateNormalized < minDateNormalized
          } : undefined}
          initialFocus
          className="rounded-md border-0"
        />
      </PopoverContent>
    </Popover>
  )
}

DateInput.displayName = 'DateInput'

export { DateInput }
export default DateInput