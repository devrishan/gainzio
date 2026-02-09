"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

"use client"

import * as React from "react"
import { addDays, format, subDays, startOfMonth, endOfMonth, startOfToday, endOfToday, startOfYesterday, endOfYesterday } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {

    const [preset, setPreset] = React.useState<string>("");

    // Handle preset selection
    const handlePresetChange = (value: string) => {
        setPreset(value);
        const today = new Date();

        switch (value) {
            case "today":
                setDate({ from: startOfToday(), to: endOfToday() });
                break;
            case "yesterday":
                setDate({ from: startOfYesterday(), to: endOfYesterday() });
                break;
            case "last7":
                setDate({ from: subDays(today, 7), to: today });
                break;
            case "last30":
                setDate({ from: subDays(today, 30), to: today });
                break;
            case "thisMonth":
                setDate({ from: startOfMonth(today), to: endOfMonth(today) });
                break;
            case "clean":
                setDate(undefined);
                setPreset("");
                break;
        }
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-medium bg-neutral-900/50 border-white/5 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd")} - {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                        <ChevronDown className="ml-auto h-3 w-3 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-neutral-950 border-white/10 text-white" align="end">
                    <div className="p-3 border-b border-white/5 space-y-2">
                        <Select onValueChange={handlePresetChange} value={preset}>
                            <SelectTrigger className="w-full bg-neutral-900 border-white/5 text-xs h-8">
                                <SelectValue placeholder="Quick Filters" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/5 text-white">
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="last7">Last 7 Days</SelectItem>
                                <SelectItem value="last30">Last 30 Days</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(newDate) => {
                            setDate(newDate);
                            setPreset(""); // Clear preset if manually selecting
                        }}
                        numberOfMonths={2}
                        className="bg-neutral-950 text-white p-3"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
