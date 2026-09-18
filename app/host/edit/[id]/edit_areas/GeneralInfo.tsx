'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import PrimaryFields from './PrimaryFields';
import { GeneralInfoProps } from './types/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';

import { useAtom } from 'jotai';
import { formAtom } from '../store/jotai';

import { useFormStore } from '../store/formStore'; // path a tu store

import {
  Card,
  CardTitle,
  FieldLabel,
  inputSkin,
  selectPopoverSkin,
} from './ui';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Clock } from 'lucide-react';

export default function EditArea({
  data,
  childSaveOnUnmount,
}: GeneralInfoProps) {
  const setForm = useFormStore((state) => state.setForm);

  const [showAllDates, setShowAllDates] = useState(false);

  const [period, setPeriod] = useState<'manual' | 'weekly' | string>(
    data.dates.period,
  );
  const [weekDay, setWeekDay] = useState<string | null>(data.dates.day_of_week);
  const [dates, setDates] = React.useState<Date[]>(
    data.dates.list_of_dates.map((d: string) => new Date(d)),
  );

  const [fromTime, setFromTime] = useState(data.dates.time.from);
  const [toTime, setToTime] = useState(data.dates.time.to);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const jamTitleRef = useRef(data.jam_title);
  const locationTitleRef = useRef(data.location_title);
  const locationAddressRef = useRef(data.location_address);
  const coordinatesRef = useRef(data.coordinates);
  const datesRef = useRef(data.dates);

  datesRef.current = {
    period: period,
    day_of_week: weekDay,
    time: { from: fromTime, to: toTime },
    list_of_dates: dates.map((d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // month +1 because 0-based
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // "YYYY-MM-DD" local
    }),
  };

  function updateDataRef() {
    if (datesRef.current.period === 'weekly') {
      datesRef.current.list_of_dates = [];
    }

    setForm((prev) => ({
      ...prev,
      generalInfo: {
        jam_title: jamTitleRef.current,
        location_title: locationTitleRef.current,
        location_address: locationAddressRef.current,
        coordinates: coordinatesRef.current,
        dates: datesRef.current,
      },
    }));
  }

  useEffect(() => {
    childSaveOnUnmount.current = updateDataRef;

    return () => {
      childSaveOnUnmount.current = () => Promise.resolve();
    };
  }, []);

  const isWeekly = period === 'weekly';


  return (
    <div className="flex flex-col gap-10">
      {/* ---------------- the basics ---------------- */}
      <Card flat>
        <CardTitle
          title="The basics"
          hint="How the jam shows up in listings and where people will find it."
        />
        <PrimaryFields
          jamTitleRef={jamTitleRef}
          locationTitleRef={locationTitleRef}
          locationAddressRef={locationAddressRef}
          coordinatesRef={coordinatesRef}
        />
      </Card>

      {/* ---------------- schedule ---------------- */}
      <Card flat>
        <CardTitle
          title="Schedule"
          hint="Repeat it weekly, or pick the exact dates on the calendar."
        />

        {/* Sized to their content rather than stretched across the card. A
            3-column grid gave "21:00" the same ~380px as a full address. */}
        <div className="flex flex-wrap gap-5">
          <div className="flex flex-col gap-2 w-full sm:w-64">
            <FieldLabel>Repeats</FieldLabel>
            <Select
              defaultValue={period}
              onValueChange={(value) => setPeriod(value as 'manual' | 'weekly')}
            >
              <SelectTrigger className="w-full rounded-xl border-zinc-200 bg-zinc-50/60 py-2.5 text-[14px]">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent className={selectPopoverSkin}>
                <SelectGroup>
                  <SelectLabel>Period</SelectLabel>
                  <SelectItem value="manual">
                    Select manually on calendar
                  </SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Second select */}
          <div className="flex flex-col gap-2 w-full sm:w-52">
            <FieldLabel
              className={period === 'weekly' ? '' : 'text-zinc-300'}
            >
              Day of the week
            </FieldLabel>
            {period === 'weekly' ? (
              <Select
                defaultValue={
                  period === 'weekly'
                    ? weekDay
                      ? weekDay
                      : undefined
                    : undefined
                }
                onValueChange={setWeekDay}
              >
                <SelectTrigger className="w-full rounded-xl border-zinc-200 bg-zinc-50/60 py-2.5 text-[14px]">
                  <SelectValue placeholder="Select day of week" />
                </SelectTrigger>
                <SelectContent className={selectPopoverSkin}>
                  <SelectGroup>
                    <SelectLabel>Day</SelectLabel>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <Select disabled>
                <SelectTrigger className="w-full rounded-xl border-zinc-200 bg-zinc-100/70 py-2.5 text-[14px]">
                  <SelectValue placeholder="N/A" />
                </SelectTrigger>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-32">
            <FieldLabel>Starting time</FieldLabel>
            <TimeField value={fromTime} onChange={setFromTime} />
          </div>
        </div>

        {/* ---------------- calendar ----------------
            On Weekly the calendar is dimmed and inert rather than removed: it
            stays visible so it's obvious that picking exact dates is an option,
            which a hidden section wouldn't tell anyone. */}
        <div
          className={`mt-7 border-t border-zinc-100 pt-6 transition-opacity ${
            isWeekly ? 'pointer-events-none opacity-45 select-none' : ''
          }`}
          aria-disabled={isWeekly}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-snug text-zinc-500">
              {isWeekly
                ? 'Not used on Weekly — switch Repeats to "Select manually on calendar" to pick exact dates.'
                : 'Pick the dates below — each one keeps the starting time above.'}
            </p>
            <button
              type="button"
              className="
                self-start rounded-lg border border-zinc-200 bg-white px-3 py-1.5
                text-[12px] font-semibold tracking-tight text-zinc-600
                transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900
                cursor-pointer sm:self-auto
              "
              onClick={() => setDates([])}
            >
              Clear dates
            </button>
          </div>

          <Calendar03
            period={period}
            weekDay={weekDay}
            dates={dates}
            datesSetter={setDates}
          />

          <div className="mt-5">
            <FieldLabel>Selected dates</FieldLabel>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {dates.length === 0 ? (
                <span className="text-[13px] text-zinc-400">
                  No dates selected yet.
                </span>
              ) : null}
              {/* Collapsed to 3 by default; "+N more" expands the rest instead
                  of only counting them, so a long list can actually be checked.
                  Each chip can be dropped individually — only meaningful in
                  manual mode, since Weekly is a single flag on the row rather
                  than a set of dates. */}
              {(showAllDates ? dates : dates.slice(0, 3)).map((date, i) => (
                <span
                  key={date.getTime()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 py-1 pr-1.5 pl-3 text-[12px] font-medium tabular-nums text-emerald-800 ring-1 ring-emerald-600/15 ring-inset"
                >
                  {date.toLocaleDateString()} · {fromTime}
                  <button
                    type="button"
                    aria-label={`Remove ${date.toLocaleDateString()}`}
                    onClick={() =>
                      setDates(dates.filter((d) => d.getTime() !== date.getTime()))
                    }
                    className="grid h-4 w-4 cursor-pointer place-items-center rounded-full text-emerald-800/50 transition-colors hover:bg-emerald-600/15 hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              {dates.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllDates((prev) => !prev)}
                  className="cursor-pointer text-[12px] font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
                >
                  {showAllDates ? 'Show less' : `+${dates.length - 3} more`}
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);
/** Five-minute granularity: jams start at 21:00 or 21:30, never at 21:37. */
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0'),
);

/**
 * Compact time field.
 *
 * `<input type="time">` keeps the field small but opens the browser's own
 * picker — that blue scrolling column is drawn by the OS, outside the page, so
 * no CSS can bring it in line with this form (and it looks different again on
 * Safari and Firefox). This keeps the single compact field and replaces only
 * the popup. Still reads and writes the same "HH:MM" string.
 */
function TimeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [hour, minute] = (value || '21:00').split(':');
  // A stored value off the 5-minute grid stays selectable rather than vanishing.
  const minutes = MINUTE_OPTIONS.includes(minute)
    ? MINUTE_OPTIONS
    : [...MINUTE_OPTIONS, minute].sort();

  const column =
    'flex max-h-56 flex-1 flex-col gap-0.5 overflow-y-auto p-1.5 [scrollbar-width:thin]';
  const cell = (active: boolean) =>
    `shrink-0 cursor-pointer rounded-lg px-2 py-1.5 text-[13px] tabular-nums transition-colors ${
      active
        ? 'bg-emerald-600 font-semibold text-white'
        : 'text-zinc-700 hover:bg-zinc-100'
    }`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${inputSkin} flex cursor-pointer items-center justify-between text-left`}
        >
          <span className="tabular-nums">{value || '--:--'}</span>
          <Clock className="size-4 shrink-0 text-zinc-400" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-40 border-zinc-200 bg-white p-0 shadow-lg ring-1 ring-zinc-900/5"
      >
        <div className="flex divide-x divide-zinc-100">
          <div className={column}>
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                className={cell(h === hour)}
                onClick={() => onChange(`${h}:${minute}`)}
              >
                {h}
              </button>
            ))}
          </div>
          <div className={column}>
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                className={cell(m === minute)}
                onClick={() => onChange(`${hour}:${m}`)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface Calendar03Props {
  period?: 'manual' | 'weekly' | string;
  weekDay?: string | null;
  dates?: Date[];
  datesSetter?: (dates: Date[]) => void;
}

export function Calendar03({
  period,
  weekDay,
  dates,
  datesSetter = () => {},
}: Calendar03Props) {
  const [numMonths, setNumMonths] = useState(2);

  useEffect(() => {
    const handleResize = () => setNumMonths(window.innerWidth >= 1024 ? 2 : 1); // lg breakpoint = 1024px
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (period === 'weekly' && weekDay) {
      const dayIndex = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ].indexOf(weekDay);
      if (dayIndex === -1) return;

      const today = new Date();
      // Midnight, so a jam earlier today still counts as upcoming.
      today.setHours(0, 0, 0, 0);
      const newDates: Date[] = [];

      // fill next 3 months with that weekday
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const year = today.getFullYear();
        const month = today.getMonth() + monthOffset;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
          const date = new Date(year, month, d);
          // Filling from the 1st of the current month used to select dates
          // that had already passed.
          if (date.getDay() === dayIndex && date >= today)
            newDates.push(date);
        }
      }

      datesSetter(newDates);
    }
  }, [period, weekDay]);

  return (
    <Calendar
      mode="multiple"
      numberOfMonths={numMonths}
      required
      selected={dates}
      onSelect={datesSetter}
      // The day button styles itself from --primary / --accent, which follow
      // the app theme — on a dark theme that made a selected day near-white on
      // a white calendar (invisible) and turned the number near-white on hover
      // (it looked like the number vanished). Pinned to the form's own palette.
      className="mx-auto w-fit rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 shadow-none
                 [&_[data-selected-single=true]]:!bg-emerald-600
                 [&_[data-selected-single=true]]:!text-white
                 [&_[data-selected-single=true]]:!font-semibold
                 [&_button:not([data-selected-single=true]):hover]:!bg-zinc-200
                 [&_button:not([data-selected-single=true]):hover]:!text-zinc-900"
    />
  );
}
