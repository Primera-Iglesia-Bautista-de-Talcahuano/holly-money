"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  name,
  defaultValue,
  value,
  onChange,
}: {
  name?: string
  defaultValue?: string
  value?: Date
  onChange?: (date: Date | undefined) => void
}) {
  const defaultDate = defaultValue ? new Date(defaultValue) : undefined
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(defaultDate)
  const date = value !== undefined ? value : internalDate;

  const handleSelect = (newDate: Date | undefined) => {
    setInternalDate(newDate);
    onChange?.(newDate);
  }

  return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant={"outline"}
          size="2xl"
          className={cn(
            "w-full justify-start text-left font-normal bg-surface-container-lowest border-none",
            !date && "text-muted-foreground"
          )}
        />
      }>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>Seleccionar fecha</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-popover text-popover-foreground shadow-md rounded-xl overflow-hidden ring-1 ring-border">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
      {/* Hidden input to allow native form submission method="GET" */}
      <input 
        type="hidden" 
        name={name} 
        value={date ? format(date, "yyyy-MM-dd") : ""} 
      />
    </Popover>
  )
}
