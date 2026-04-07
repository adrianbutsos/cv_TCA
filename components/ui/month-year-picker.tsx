"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MonthYearPickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export function MonthYearPicker({ value, onChange, placeholder = "Select date" }: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedMonth, setSelectedMonth] = React.useState<number>(0)
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear())
  const [displayValue, setDisplayValue] = React.useState(value)

  // Parse the input value (e.g., "Sep 2021")
  React.useEffect(() => {
    if (value) {
      const parts = value.trim().split(" ")
      if (parts.length === 2) {
        const monthStr = parts[0]
        const yearStr = parts[1]
        const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === monthStr.toLowerCase())
        if (monthIndex !== -1 && !isNaN(parseInt(yearStr))) {
          setSelectedMonth(monthIndex)
          setSelectedYear(parseInt(yearStr))
          setDisplayValue(value)
        }
      }
    }
  }, [value])

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex)
    const newValue = `${MONTHS[monthIndex]} ${selectedYear}`
    setDisplayValue(newValue)
    onChange(newValue)
  }

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear)
    const newValue = `${MONTHS[selectedMonth]} ${newYear}`
    setDisplayValue(newValue)
    onChange(newValue)
  }

  const handleDirectInput = (inputValue: string) => {
    setDisplayValue(inputValue)
    onChange(inputValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={displayValue}
          onChange={(e) => handleDirectInput(e.target.value)}
          placeholder={placeholder}
          className="cursor-pointer"
          readOnly={false}
        />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          {/* Year selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(selectedYear - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value) || selectedYear)}
                className="text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(selectedYear + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Month selector grid */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Month</label>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, index) => (
                <Button
                  key={month}
                  variant={selectedMonth === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMonthSelect(index)}
                  className="text-xs"
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>

          {/* Display selected date */}
          {displayValue && (
            <div className="text-sm text-muted-foreground text-center">
              Selected: <span className="font-medium text-foreground">{displayValue}</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
