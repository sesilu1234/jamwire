'use client';
import { useState, useRef, useEffect } from 'react';
import { PlaceCharsProps } from './types/types';
import { useFormStore } from '../store/formStore';

import { Card, CardTitle, FieldLabel, inputSkin } from './ui';

const all_styles = [
  'Blues', 'Rock', 'All styles', 'Country', 'Jazz', 'Pop', 'Funk', 'Soul',
  'Reggae', 'Metal', 'Hip-Hop', 'R&B', 'Disco', 'House', 'Trance',
  'Electronic', 'Acoustic', 'Singer-Songwriter', 'Folk', 'Indie',
  'Alternative', 'Roots', 'Afro', 'Fusion', 'Latin', 'Improvisation',
];

export default function PlaceChars({ data, childSaveOnUnmount }: PlaceCharsProps) {
  const setForm = useFormStore((state) => state.setForm);
  const [search, setSearch] = useState('');
  const [modality, setModality] = useState<string>(data.modality);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(data.styles);
  const [song_list, setSongList] = useState<boolean>(data.song_list);
  const [instruments_lend, setIntrumentsLend] = useState<boolean>(data.intruments_lend);
  const [drums, setDrums] = useState<boolean>(data.drums);

  const refs = useRef({ modality, selectedStyles, song_list, instruments_lend, drums });
  useEffect(() => {
    refs.current = { modality, selectedStyles, song_list, instruments_lend, drums };
  }, [modality, selectedStyles, song_list, instruments_lend, drums]);

  function updateDataRef() {
    setForm((prev) => ({
      ...prev,
      features: {
        modality: refs.current.modality as 'open_mic' | 'jam',
        styles: refs.current.selectedStyles,
        song_list: refs.current.song_list,
        intruments_lend: refs.current.instruments_lend,
        drums: refs.current.drums,
      },
    }));
  }

  useEffect(() => {
    childSaveOnUnmount.current = updateDataRef;
    return () => { childSaveOnUnmount.current = () => {}; };
  }, []);

  const filteredStyles = all_styles.filter((style) =>
    style.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const stylesFull = selectedStyles.length >= 3;

  return (
    <div className="flex flex-col gap-5">
      {/* --- MODALITY --- */}
      <Card>
        <CardTitle
          title="Event modality"
          hint="Is it an open jam where people join in, or an open mic with slots?"
        />
        <div className="inline-flex gap-1 rounded-2xl bg-zinc-100 p-1.5">
          {['jam', 'open_mic'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setModality(option)}
              className={`px-5 py-2.5 sm:px-8 rounded-xl text-[13px] font-bold capitalize tracking-tight transition-all duration-200 cursor-pointer ${
                modality === option
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-700'
              }`}
            >
              {option.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* --- STYLES --- */}
      <Card>
        <CardTitle
          title="Musical styles"
          hint="Pick up to 3 so people know what they’re walking into."
          action={
            <span
              className={`
                inline-flex items-center gap-1.5 rounded-full px-3 py-1
                text-[12px] font-semibold tabular-nums ring-1 ring-inset
                ${
                  stylesFull
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20'
                    : 'bg-zinc-100 text-zinc-600 ring-zinc-300/60'
                }
              `}
            >
              {selectedStyles.length} / 3
            </span>
          }
        />

        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="18px"
            viewBox="0 -960 960 960"
            width="18px"
            fill="currentColor"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>
          <input
            type="search"
            placeholder="Search styles…"
            className={`${inputSkin} pl-10`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 flex max-h-64 w-full flex-wrap gap-2 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
          {filteredStyles.length === 0 ? (
            <span className="px-1 py-2 text-[13px] text-zinc-400">
              No styles match “{search}”.
            </span>
          ) : null}

          {filteredStyles.map((style) => {
            const isSelected = selectedStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-100 hover:ring-zinc-300'
                }`}
                onClick={() => toggleStyle(style)}
              >
                {style}
                <span className={`text-[14px] leading-none ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                  {isSelected ? '×' : '+'}
                </span>
              </button>
            );
          })}
        </div>

        {selectedStyles.length > 0 && (
          <div className="mt-4">
            <FieldLabel>Selected</FieldLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedStyles.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/15"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* --- TOGGLES --- */}
      <Card>
        <CardTitle
          title="What the venue provides"
          hint="Helps musicians know what to bring."
        />
        <div className="flex flex-col divide-y divide-zinc-100">
          {[
            { label: 'Is there a setlist?', state: song_list, setter: setSongList },
            { label: 'Instruments available?', state: instruments_lend, setter: setIntrumentsLend },
            { label: 'Is there a drum kit?', state: drums, setter: setDrums },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
            >
              <span className="text-[14px] font-medium tracking-tight text-zinc-800">
                {item.label}
              </span>
              <div className="inline-flex gap-1 rounded-xl bg-zinc-100 p-1">
                <button
                  type="button"
                  className={`w-16 rounded-lg py-1.5 text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                    item.state
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                  onClick={() => item.setter(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`w-16 rounded-lg py-1.5 text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                    !item.state
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                  onClick={() => item.setter(false)}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
