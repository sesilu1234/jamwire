'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
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

import { Card, CardTitle, FieldLabel } from './ui';

export default function EditArea({
  data,
  childSaveOnUnmount,
}: GeneralInfoProps) {
  const setForm = useFormStore((state) => state.setForm);

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

  return (
    <div className="flex flex-col gap-5">
      {/* ---------------- the basics ---------------- */}
      <Card>
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
      <Card>
        <CardTitle
          title="Schedule"
          hint="Repeat it weekly, or pick the exact dates on the calendar."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <FieldLabel>Repeats</FieldLabel>
            <Select
              defaultValue={period}
              onValueChange={(value) => setPeriod(value as 'manual' | 'weekly')}
            >
              <SelectTrigger className="w-full rounded-xl border-zinc-200 bg-zinc-50/60 py-5 text-[14px]">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent>
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
          <div className="flex flex-col gap-2">
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
                <SelectTrigger className="w-full rounded-xl border-zinc-200 bg-zinc-50/60 py-5 text-[14px]">
                  <SelectValue placeholder="Select day of week" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger className="w-full rounded-xl border-zinc-200 bg-zinc-100/70 py-5 text-[14px]">
                  <SelectValue placeholder="N/A" />
                </SelectTrigger>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="time-from">Starting time</FieldLabel>
            <Input
              type="time"
              id="time-from"
              step="60"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="w-full appearance-none rounded-xl border-zinc-200 bg-zinc-50/60 py-5 text-center text-[14px] tabular-nums"
            />
          </div>
        </div>

        {/* ---------------- calendar ---------------- */}
        <div className="mt-7 border-t border-zinc-100 pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-snug text-zinc-500">
              Pick the dates below — each one keeps the starting time above.
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
              {dates.slice(0, 3).map((date, i) => (
                <span
                  key={i}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium tabular-nums text-emerald-800 ring-1 ring-inset ring-emerald-600/15"
                >
                  {date.toLocaleDateString()} · {fromTime}{' '}
                  {/* use state directly */}
                </span>
              ))}
              {dates.length > 3 && (
                <span className="text-[12px] font-medium text-zinc-500">
                  +{dates.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
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
      const newDates: Date[] = [];

      // fill next 3 months with that weekday
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const year = today.getFullYear();
        const month = today.getMonth() + monthOffset;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
          const date = new Date(year, month, d);
          if (date.getDay() === dayIndex) newDates.push(date);
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
      className="mx-auto w-fit rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 shadow-none"
    />
  );
}
