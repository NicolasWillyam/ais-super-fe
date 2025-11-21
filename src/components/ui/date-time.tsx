"use client";

import * as React from "react";
import { Calendar1, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [time, setTime] = React.useState<string>(() => {
    if (!value) return "";
    return value.toTimeString().split(" ")[0]; // "HH:MM:SS"
  });

  // Khi value thay đổi từ ngoài
  React.useEffect(() => {
    if (value) setTime(value.toTimeString().split(" ")[0]);
  }, [value]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setTime(t);
    if (!value) return;
    const newDate = new Date(value);
    const [h, m, s] = t.split(":").map(Number);
    newDate.setHours(h, m, s);
    onChange(newDate);
  };

  return (
    <div className="flex rounded-full shadow-md">
      <div className="flex flex-col">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-36 justify-between font-normal rounded-none rounded-l-full"
            >
              <div className="flex items-center gap-2">
                <Calendar1 />
                {value
                  ? value.toLocaleDateString()
                  : placeholder || "Select date"}
              </div>
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              captionLayout="dropdown"
              onSelect={(date) => {
                if (!date) return;
                const newDate = new Date(date);
                // giữ nguyên giờ phút nếu đã có
                if (value) {
                  newDate.setHours(
                    value.getHours(),
                    value.getMinutes(),
                    value.getSeconds()
                  );
                }
                onChange(newDate);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={handleTimeChange}
          className="rounded-none pl-2 rounded-r-full bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
