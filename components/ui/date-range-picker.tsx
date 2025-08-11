'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { addDays, format } from 'date-fns';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

interface CalendarDateRangePickerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange | undefined;
  onDateChange?: (date: DateRange | undefined) => void;
}

export function CalendarDateRangePicker({
  className,
  date,
  onDateChange
}: CalendarDateRangePickerProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(
    {
      from: new Date(),
      to: addDays(new Date(), 0)
    }
  );

  const selectedDate = date ?? internalDate;
  const handleDateChange = onDateChange ?? setInternalDate;

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'h-full w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-4 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, 'LLL dd, y')} -{' '}
                  {format(selectedDate.to, 'LLL dd, y')}
                </>
              ) : (
                format(selectedDate.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={handleDateChange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
