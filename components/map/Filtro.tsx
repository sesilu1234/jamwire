'use client';
import { useState, useRef, useEffect } from 'react';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useMapContext } from '@/components/map/MapContext';
import { toast } from 'sonner';


type Marker = {
  id: string;
  lat: number;
  lng: number;
};

import { Dispatch, SetStateAction } from 'react';

import { JamCard } from '@/types/jam';

type FiltroProps = {
  setJams: Dispatch<SetStateAction<JamCard[]>>; // replace `any` with your Jam[] type
  setLoading: Dispatch<SetStateAction<boolean>>;
  setSearchType: Dispatch<SetStateAction<'local' | 'global'>>;
};



export const MIN_DISTANCE_KM = 1;
export const MAX_DISTANCE_KM = 100;

export default function Filtro({
  setJams,
  setLoading,
  setSearchType,
}: FiltroProps) {
  const [open, setOpen] = useState(false);
  const panelRef_1 = useRef<HTMLDivElement | null>(null);
  const panelRef_2 = useRef<HTMLDivElement | null>(null);
  const panelRef_3 = useRef<HTMLDivElement | null>(null);

  const calendarRef = useRef<HTMLDivElement | null>(null);

  const [dateOptions, setDateOptions] = useState('week');
  const [order, setOrder] = useState('soonest');
  const [distance, setDistance] = useState(60);
  const [styles, setStyles] = useState<string[]>([]);

  // Default: Both are active
  const [modality, setModality] = useState(['jam', 'open_mic']);

  const toggleModality = (type: string) => {
    setModality((prev) => {
      // If clicking an active one, only remove it if the other one is still there
      if (prev.includes(type)) {
        return prev.length > 1 ? prev.filter((t) => t !== type) : prev;
      }
      // Otherwise add it
      return [...prev, type];
    });
  };

  const [dateOptionsGlobal, setdateOptionsGlobal] = useState('all');
  const [stylesGlobal, setstylesGlobal] = useState<string[]>([]);
  const [modalityGlobal, setModalityGlobal] = useState(['jam', 'open_mic']);

  const toggleModalityGlobal = (type: string) => {
    setModalityGlobal((prev) => {
      // If clicking an active one, only remove it if the other one is still there
      if (prev.includes(type)) {
        return prev.length > 1 ? prev.filter((t) => t !== type) : prev;
      }
      // Otherwise add it
      return [...prev, type];
    });
  };

  const dateOptionsHold = useRef('week');
  const orderHold = useRef('soonest');
  const distanceHold = useRef(60);
  const stylesHold = useRef<string[]>([]);
  const modalityHold = useRef<string[]>(['jam', 'open_mic']);

  const dateOptionsGlobalHold = useRef('all');
  const stylesGlobalHold = useRef<string[]>([]);
  const modalityGlobalHold = useRef<string[]>(['jam', 'open_mic']);

  const dateOptionsRef = useRef(dateOptions);
  dateOptionsRef.current = dateOptions;

  const orderRef = useRef(order);
  orderRef.current = order;

  const distanceRef = useRef(distance);
  distanceRef.current = distance;

  const stylesRef = useRef(styles);
  stylesRef.current = styles;

  const modalityRef = useRef(modality);
  modalityRef.current = modality;

  const dateOptionsRefGlobal = useRef(dateOptionsGlobal);
  dateOptionsRefGlobal.current = dateOptionsGlobal;

  const stylesRefGlobal = useRef(stylesGlobal);
  stylesRefGlobal.current = stylesGlobal;

  const modalityGlobalRef = useRef(modalityGlobal);
  modalityGlobalRef.current = modalityGlobal;

  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const [showCalendarMap, setShowCalendarMap] = useState<boolean>(false);

  const [cardFiltersOpen, setCardFiltersOpen] = useState(true);

  const [date, setDate] = useState<Date | undefined>(new Date());

  const [dateGlobal, setdateGlobal] = useState<Date | undefined>(new Date());

  const { locationSearch, setMarkersData, map, searchRadiusKm, setSearchRadiusKm } =
    useMapContext();

  // "Search this area" writes a radius derived from the viewport. Mirror it
  // into the panel so the slider doesn't claim 60km while the map shows 12,
  // and into the ref directly so a fetch in this same tick uses the new value.
  // Declared before the locationSearch effect below, which depends on it.
  useEffect(() => {
    if (searchRadiusKm != null && searchRadiusKm !== distanceRef.current) {
      distanceRef.current = searchRadiusKm;
      distanceHold.current = searchRadiusKm;
      setDistance(searchRadiusKm);
    }
  }, [searchRadiusKm]);

  // Close on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !panelRef_1.current?.contains(event.target as Node) &&
        !panelRef_2.current?.contains(event.target as Node) &&
        !panelRef_3.current?.contains(event.target as Node)
      ) {
        setDateOptions(dateOptionsHold.current);
        setOrder(orderHold.current);
        setDistance(distanceHold.current);
        setStyles([...stylesHold.current]);
        setModality([...modalityHold.current]);

        setdateOptionsGlobal(dateOptionsGlobalHold.current);
        setstylesGlobal([...stylesGlobalHold.current]);
        setModalityGlobal([...modalityGlobalHold.current]);
        setOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDateOptions(dateOptionsHold.current);
        setOrder(orderHold.current);
        setDistance(distanceHold.current);
        setStyles([...stylesHold.current]);
        setModality([...modalityHold.current]);

        setdateOptionsGlobal(dateOptionsGlobalHold.current);
        setstylesGlobal([...stylesGlobalHold.current]);
        setModalityGlobal([...modalityGlobalHold.current]);
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleAccept = (searchType: 'local' | 'global') => {
    setSearchType(searchType);
    fetchJams(searchType);

    if (searchType === 'local') {
      // sync state → refs
      dateOptionsHold.current = dateOptions;
      orderHold.current = order;
      distanceHold.current = distance;
      stylesHold.current = [...styles];
      modalityHold.current = [...modality];

      setSearchRadiusKm(distance);

      // Frame the search area instead of jumping to a fixed zoom: at 5km the
      // old zoom 11 was far too wide, at 100km the area ran off screen.
      // Bounding box of the search circle, computed without leaflet: importing
      // it at module scope here breaks SSR, and `map` is only available at
      // runtime anyway. 111.32km is one degree of latitude; longitude degrees
      // shrink by cos(lat).
      const { lat, lng } = locationSearch!.coordinates;
      const dLat = distance / 111.32;
      const dLng = distance / (111.32 * Math.cos((lat * Math.PI) / 180));
      map!.flyToBounds(
        [
          [lat - dLat, lng - dLng],
          [lat + dLat, lng + dLng],
        ],
        { duration: 1.5, padding: [24, 24] },
      );
    } else {
      // sync state → refs
      dateOptionsGlobalHold.current = dateOptionsGlobal;
      stylesGlobalHold.current = [...stylesGlobal];
      modalityGlobalHold.current = [...modalityGlobal];

      // A global search is not bounded by a radius, so the circle comes off.
      setSearchRadiusKm(null);

      map!.flyTo(
        [locationSearch!.coordinates.lat, locationSearch!.coordinates.lng],
        4,
        { duration: 1.5 },
      );
    }

    setOpen(false);
  };

  const fetchJams = async (searchType: 'local' | 'global') => {
    try {
      if (searchType === 'local') {
   
        setLoading(true);

        const paramsCards = new URLSearchParams({
          dateOptions: dateOptionsRef.current,
          order: String(orderRef.current),
          lat: String(locationSearch?.coordinates.lat),
          lng: String(locationSearch?.coordinates.lng),
          distance: String(distanceRef.current),
          styles: JSON.stringify(stylesRef.current),
          modality: JSON.stringify(modalityRef.current),
        });

      

        const cardsFetch = await fetch(
          `/api/public/get-jams-cards-filtered?${paramsCards}`,
        );

        if (!cardsFetch.ok) throw new Error('Failed to fetch jams');

        const resCards = await cardsFetch.json();

        setMarkersData(
          resCards?.map((jam: Marker) => ({
            id: jam.id,
            lat: jam.lat,
            lng: jam.lng,
          })),
        );
        setJams(resCards);
      }

      if (searchType === 'global') {
        const paramsMarkers = new URLSearchParams({
          dateOptions: dateOptionsRefGlobal.current,
          styles: JSON.stringify(stylesRefGlobal.current),
          modality: JSON.stringify(modalityGlobalRef.current),
        });

        const markersFetch = await fetch(
          `/api/public/get-jams-markers-filtered?${paramsMarkers}`,
        );

        if (!markersFetch.ok) throw new Error('Failed to fetch jams');

        const resMarkers = await markersFetch.json();
        setMarkersData(resMarkers);
        setJams([]);
      }
    } catch (e) {
      // This used to console.log and stop, leaving the previous results on
      // screen with no sign that the new search had failed.
      console.error('error fetching jams', e);
      toast.error("Couldn't load jams", {
        description: 'Check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return; // Exit early on first mount
    }

    if (locationSearch) {
      setSearchType('local');
      fetchJams('local');
    }
 
  }, [locationSearch]);

  return (
    <>
      {/* Filter button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex h-12 shrink-0 cursor-pointer items-center gap-2
                    rounded border px-4 transition-colors select-none
                    focus-visible:ring-2 focus-visible:ring-tone-0/25 focus-visible:outline-none ${
                      open
                        ? 'border-tone-0/35 bg-tone-4 text-tone-0'
                        : 'border-tone-3 bg-tone-4/60 text-tone-1 hover:border-tone-0/30 hover:bg-tone-4/80'
                    }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="19px"
          viewBox="0 -960 960 960"
          width="19px"
          className="shrink-0 transition-colors duration-200"
        >
          <path
            d="M120-40v-168q-35-12-57.5-42.5T40-320v-400h80v-160q0-17 11.5-28.5T160-920q17 0 28.5 11.5T200-880v160h80v400q0 39-22.5 69.5T200-208v168h-80Zm320 0v-168q-35-12-57.5-42.5T360-320v-400h80v-160q0-17 11.5-28.5T480-920q17 0 28.5 11.5T520-880v160h80v400q0 39-22.5 69.5T520-208v168h-80Zm320 0v-168q-35-12-57.5-42.5T680-320v-400h80v-160q0-17 11.5-28.5T800-920q17 0 28.5 11.5T840-880v160h80v400q0 39-22.5 69.5T840-208v168h-80ZM120-640v160h80v-160h-80Zm320 0v160h80v-160h-80Zm320 0v160h80v-160h-80ZM160-280q17 0 28.5-11.5T200-320v-80h-80v80q0 17 11.5 28.5T160-280Zm320 0q17 0 28.5-11.5T520-320v-80h-80v80q0 17 11.5 28.5T480-280Zm320 0q17 0 28.5-11.5T840-320v-80h-80v80q0 17 11.5 28.5T800-280ZM160-440Zm320 0Zm320 0Z"
            className="fill-current"
          />
        </svg>
        <span className="text-sm font-semibold select-none">Filter</span>
      </button>

      {/* Overlay + Filter Panel */}
      {open && (
        <div className="fixed inset-0 z-[503] flex flex-col items-center pt-5 
                  bg-slate-900/40 backdrop-blur-[1px] transition-all duration-300">
          <div className="relative w-[92%] md:w-xl">
            <div
              ref={panelRef_1}
              className="flex w-fit justify-center items-end gap-0 mx-auto text-tone-6"
            >
              <div
                className={`pt-5 pb-2 px-2 bg-white text-black w-30 md:w-40 rounded-t-xl text-center cursor-pointer ${
                  cardFiltersOpen
                    ? ''
                    : ' border-3 md:border-4 border-tone-3/40'
                }`}
                onClick={() => setCardFiltersOpen(true)}
              >
                Local
              </div>

              <div
                className={`pt-5 pb-2 px-2 bg-white text-black w-30 md:w-40 rounded-t-xl text-center cursor-pointer ${
                  cardFiltersOpen
                    ? 'border-3 md:border-4  border-tone-3/40'
                    : ''
                }`}
                onClick={() => setCardFiltersOpen(false)}
              >
                Global
              </div>
            </div>

            {cardFiltersOpen ? (
              <div
                ref={panelRef_2}
                className="relative bg-white text-black  p-6 pt-0 rounded-xl shadow-lg overflow-y-auto h-[70vh] "
              >
                <div className="flex justify-center mb-5 mt-5">
                  <div className="flex flex-col items-center pt-4 px-8 border-b border-stone-100">
                    <h2 className="text-3xl font-medium text-stone-800 tracking-tight ">
                      Local
                    </h2>
                    <p className="text-stone-400 text-sm mt-1">
                      Adjust the cards
                    </p>
                  </div>
                </div>
                <div className="relative flex flex-col gap-12 md:pl-4">
                  <div className="absolute -right-2 -top-25 h-full w-16 flex flex-col items-center pointer-events-none">
                    <button
                      onClick={() => handleAccept('local')}
                      className="sticky top-5 px-5 py-2.5 rounded-lg
                 bg-gradient-to-br from-blue-500 to-blue-600
                 hover:from-blue-600 hover:to-blue-700
                 text-white font-medium text-sm
                 shadow-sm hover:shadow-md
                 border border-blue-600/20
                 transition-all duration-200 ease-out
                 active:scale-[0.98]
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 pointer-events-auto z-[620]"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="flex flex-col ">
                    <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-neutral-700 mb-0">
                      When
                    </p>

                    <DateOptions
                      dateOptions={dateOptions}
                      setDateOption={setDateOptions}
                      showCalendar={showCalendar}
                      setShowCalendar={setShowCalendar}
                      dateRef={date}
                      setDate={setDate}
                    />
                  </div>
                  {/* SECTION: MODALITY (The New Filter) */}
                  <div className="flex flex-col">
                    <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-neutral-700 mb-8">
                      Select Modality
                    </p>
                    <div className="flex gap-2 ml-4">
                      {[
                        { id: 'jam', label: 'Jam Sessions' },
                        { id: 'open_mic', label: 'Open Mics' },
                      ].map((item) => {
                        const isActive = modality.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleModality(item.id)}
                            className={`
            relative flex items-center justify-center
            px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider
            transition-all duration-200 border

            bg-white border-stone-300 text-black shadow-[0_8px_20px_rgba(0,0,0,0.1)] -translate-y-0.5 
            ${isActive ? ' ' : 'opacity-40 border-stone-300'}
          `}
                          >
                            {item.label}
                            {/* Subtle dot indicator */}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-neutral-700 mb-0">
                      Sort
                    </p>
                    <div className="flex flex-col pt-8 gap-4 ml-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="order"
                          className="hidden peer"
                          checked={order === 'soonest'}
                          onChange={() => setOrder('soonest')}
                        />
                        <div
                          className="w-5 h-5 border-2 border-tone-2 rounded-md flex-shrink-0 
      peer-checked:bg-cyan-700 transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg
                            className="w-3 h-3 opacity-0 "
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="select-none">Most soon</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="order"
                          className="hidden peer"
                          checked={order === 'popular'}
                          onChange={() => setOrder('popular')}
                        />
                        <div
                          className="w-5 h-5 border-2 border-tone-2 rounded-md flex-shrink-0 
      peer-checked:bg-cyan-700 transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg
                            className="w-3 h-3  opacity-0 "
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="select-none">Most popular</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col ">
                    <div className="flex flex-col gap-4 ">
                      <label>
                        <SliderDemo
                          distance={distance}
                          setDistance={setDistance}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-neutral-700 mb-4">
                      Styles
                    </p>
                    <div className="flex flex-col gap-4 ml-4">
                      <label>
                        <SelectStyles styles={styles} setStyles={setStyles} />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end"></div>
                </div>
                {/* <Button
              variant={'outline'}
              className="top-5 right-5 absolute bg-[rgb(216,138,74)] text-[rgb(34,33,33)] hover:bg-[rgb(63,62,62)] hover:text-[rgb(235,235,235)]"
              onClick={() => handleAccept()}
            >
              Close
            </Button> */}
              </div>
            ) : (
              <div
                ref={panelRef_3}
                className="relative bg-white text-black   p-6 pt-0 rounded-xl shadow-lg h-[70vh] overflow-y-auto"
              >
                <div className="flex justify-center mb-5 mt-5">
                  <div className="flex flex-col items-center pt-4 px-8 border-b border-stone-100">
                    <h2 className="text-3xl font-medium text-stone-800 tracking-tight ">
                      Global
                    </h2>
                    <p className="text-stone-400 text-sm mt-1">
                      Adjust the map
                    </p>
                  </div>
                </div>
                <div className="relative flex flex-col gap-12 md:pl-4">
                  <div className="absolute -right-2 -top-25 h-full w-16 flex flex-col items-center pointer-events-none">
                    <button
                      onClick={() => handleAccept('global')}
                      className="sticky top-5 px-5 py-2.5 rounded-lg
                 bg-gradient-to-br from-blue-500 to-blue-600
                 hover:from-blue-600 hover:to-blue-700
                 text-white font-medium text-sm
                 shadow-sm hover:shadow-md
                 border border-blue-600/20
                 transition-all duration-200 ease-out
                 active:scale-[0.98]
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 pointer-events-auto z-[620]"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="flex flex-col ">
                    <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-neutral-700 mb-0">
                      When
                    </p>
                    <DateOptionsGlobal
                      dateOptions={dateOptionsGlobal}
                      setDateOption={setdateOptionsGlobal}
                      showCalendar={showCalendarMap}
                      setShowCalendar={setShowCalendarMap}
                      dateRef={dateGlobal}
                      setDate={setdateGlobal}
                    />
                  </div>
                  {/* SECTION: MODALITY (The New Filter) */}
                  <div className="flex flex-col">
                    <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-neutral-700 mb-8">
                      Select Modality
                    </p>
                    <div className="flex gap-2 ml-4">
                      {[
                        { id: 'jam', label: 'Jam Sessions' },
                        { id: 'open_mic', label: 'Open Mics' },
                      ].map((item) => {
                        const isActive = modalityGlobal.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleModalityGlobal(item.id)}
                            className={`
            relative flex items-center justify-center
            px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider
            transition-all duration-200 border

            bg-white border-stone-300 text-black shadow-[0_8px_20px_rgba(0,0,0,0.1)] -translate-y-0.5 
            ${isActive ? ' ' : 'opacity-40 border-stone-300'}
          `}
                          >
                            {item.label}
                            {/* Subtle dot indicator */}
                            {isActive && (
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-gray-700 mb-4">
                      Styles
                    </p>
                    <div className="flex flex-col gap-4 ml-4">
                      <label>
                        <SelectStyles
                          styles={stylesGlobal}
                          setStyles={setstylesGlobal}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-start mt-8 font-light">
                    This search will hide cards and show all jam markers in the
                    whole world.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

import { RefObject } from 'react';

type DateOptionsProps = {
  dateOptions: string; // or a more specific type if you have one
  setDateOption: Dispatch<SetStateAction<string>>;
  showCalendar: boolean;
  setShowCalendar: Dispatch<SetStateAction<boolean>>;
  dateRef: Date | undefined; // adjust if it's another element
  setDate: Dispatch<SetStateAction<Date | undefined>>; // adjust if needed
};

export function DateOptions({
  dateOptions,
  setDateOption,
  showCalendar,
  setShowCalendar,
  dateRef,
  setDate,
}: DateOptionsProps) {
  const calRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const options = [
    // { value: 'yesterday', label: 'Yesterday' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Next 7 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex flex-wrap  gap-3 pt-8 ml-4">
      {options.slice(0, 2).map((opt) => (
        <Button
          key={opt.value}
          variant={opt.value === dateOptions ? 'secondary' : undefined}
          className={`text-md ${
            opt.value === dateOptions ? 'bg-stone-700 ' : 'opacity-70'
          }`}
          onClick={() => setDateOption(opt.value)}
        >
          {opt.label}
        </Button>
      ))}

      <div className="relative" ref={calRef}>
        <Button
          className={`text-md ${
            dateOptions.startsWith('custom')
              ? 'hover:bg-black hover:text-white'
              : 'opacity-70'
          }`}
          variant={dateOptions.startsWith('custom') ? 'secondary' : undefined}
          onClick={() => setShowCalendar((prev) => !prev)}
        >
          {dateOptions.startsWith('custom')
            ? dateOptions.split('custom: ')[1]
            : 'Custom'}
        </Button>

        {showCalendar ? (
          <CalendarDemo
            setDateOption={setDateOption}
            dateRef={dateRef}
            setDate={setDate}
          />
        ) : null}
      </div>
    </div>
  );
}

export function DateOptionsGlobal({
  dateOptions,
  setDateOption,
  showCalendar,
  setShowCalendar,
  dateRef,
  setDate,
}: DateOptionsProps) {
  const calRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node))
        setShowCalendar(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const options = [
    { value: 'all', label: 'Show all' },
    { value: 'week', label: 'Next 7 Days' },
  ];

  return (
    <div className="flex flex-wrap  gap-3 pt-8 ml-4">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={opt.value === dateOptions ? 'secondary' : undefined}
          onClick={() => setDateOption(opt.value)}
          className={`text-md ${
            opt.value === dateOptions ? 'bg-stone-700 ' : 'opacity-70'
          }`}
        >
          {opt.label}
        </Button>
      ))}

      <div className="relative" ref={calRef}>
        <Button
          variant={dateOptions.startsWith('custom') ? 'secondary' : undefined}
          onClick={() => setShowCalendar((prev) => !prev)}
          className={`text-md ${
            dateOptions.startsWith('custom')
              ? 'hover:bg-black hover:text-white'
              : 'opacity-70'
          }`}
        >
          {dateOptions.startsWith('custom')
            ? dateOptions.split('custom: ')[1]
            : 'Custom'}
        </Button>

        {showCalendar ? (
          <CalendarDemo
            setDateOption={setDateOption}
            dateRef={dateRef}
            setDate={setDate}
          />
        ) : null}
      </div>
    </div>
  );
}

type CalendarDemoProps = {
  setDateOption: Dispatch<SetStateAction<string>>; // or your union type
  dateRef: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
};

export function CalendarDemo({
  setDateOption,
  dateRef,
  setDate,
}: CalendarDemoProps) {
  useEffect(() => {
    if (dateRef) {
      const localDate =
        dateRef.getFullYear() +
        '-' +
        String(dateRef.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(dateRef.getDate()).padStart(2, '0');

      setDateOption('custom: ' + localDate);
    }
  }, [dateRef]);

  return (
    <Calendar
      mode="single"
      selected={dateRef}
      onSelect={setDate}
      startMonth={new Date(1990, 0)}
      endMonth={new Date(2104, 11)}
      className="
        rounded-md border border-stone-400 shadow-xl bg-stone-200 z-[600]
        /* Mobile: Fixed in center of screen */
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        /* Desktop: Absolute below the button */
        md:absolute md:top-12 md:right-0 md:left-auto md:translate-x-0 md:translate-y-0
      "
      captionLayout="dropdown"
    />
  );
}

type SliderDemoProps = {
  distance: number;
  setDistance: (val: number) => void;
  className?: string;
};

export function SliderDemo({
  distance,
  setDistance,
  className,
}: SliderDemoProps) {
  return (
    <>
      <div className="flex gap-16 md:gap-32 items-end mb-4 ">
        <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-neutral-700 mb-4">
          Distance
        </p>

        <span className="pb-5 md:pb-1">{distance} km</span>
      </div>

      <Slider
        value={[distance]} // <-- array necesario
        // 0km could never return a result; MIN_DISTANCE_KM is also the floor
        // "Search this area" clamps to when you zoom right in.
        min={MIN_DISTANCE_KM}
        max={MAX_DISTANCE_KM}
        step={1}
        onValueChange={(val) => setDistance(val[0])} // <-- devolver número
        className={cn('w-[60%] ml-8 ', className)}
      />
    </>
  );
}

type SelectStylesProps = {
  styles: string[];
  setStyles: (val: string[]) => void;
};

export function SelectStyles({ styles, setStyles }: SelectStylesProps) {
  const toggleStyle = (style: string) => {
    if (styles.includes(style)) {
      setStyles(styles.filter((s) => s !== style));
    } else {
      setStyles([...styles, style]);
    }
  };
  const all_styles = [
    // Musical styles
    'Blues',
    'Rock',
    'All styles',
    'Country',
    'Jazz',
    'Pop',
    'Funk',
    'Soul',
    'Reggae',
    'Metal',
    'Hip-Hop',
    'R&B',
    'Disco',
    'House',
    'Trance',
    'Electronic',
    'Acoustic',
    'Singer-Songwriter',
    'Folk',
    'Indie',
    'Alternative',
    'Roots',
    'Afro',
    'Fusion',
    'Latin',

    // Moods / vibes
    'Improvisation',
  ];
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-2 auto-cols-max gap-2 mt-4 border border-gray-200 p-2 rounded-md overflow-x-auto bg-white">
        {all_styles.map((style) => {
          const isSelected = styles.includes(style);
          return (
            <div
              key={style}
              className={`flex items-center justify-between px-4 py-2 rounded cursor-pointer whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-slate-700 text-white' // Replaced purple with a clean Slate
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => toggleStyle(style)}
            >
              <span className="text-sm font-medium">{style}</span>
              <span className="ml-2 opacity-70">{isSelected ? '×' : '+'}</span>
            </div>
          );
        })}
      </div>

      {styles.length > 0 && (
        <div className="p-4 text-sm text-gray-600">
          <span className="font-semibold text-gray-800">Selected styles: </span>
          {styles.join(', ')}
        </div>
      )}
    </div>
  );
}
