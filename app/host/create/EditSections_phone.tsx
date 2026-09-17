'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import InfoIcon from './icons/InfoIcon';
import PhotosIcon from './icons/PhotosIcon';
import FeaturesIcon from './icons/FeaturesIcon';
import DescriptionIcon from './icons/DescriptionIcon';
import SocialIcon from './icons/SocialIcon';

const sections = [
  { id: 'informaciongeneral', label: 'General information', Icon: InfoIcon },
  { id: 'fotos', label: 'Photos', Icon: PhotosIcon },
  {
    id: 'caracteristicas',
    label: 'Site features',
    Icon: FeaturesIcon,
  },
  { id: 'descripcion', label: 'Description', Icon: DescriptionIcon },
  { id: 'redessociales', label: 'Social media', Icon: SocialIcon },
];

type EditAreaProps = {
  childSaveOnUnmount: React.RefObject<() => void>;
};

export default function EditSections_phone({
  childSaveOnUnmount,
}: EditAreaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = searchParams.get('section') || 'informaciongeneral';

  // local state for instant highlight
  const [currentSection, setCurrentSection] = useState(initialSection);

  const goToSection = (id: string) => {
    setCurrentSection(id); // instant highlight
    router.push(`/host/create?section=${id}`); // update URL
  };

  const activeIndex = sections.findIndex((s) => s.id === currentSection);

  return (
    <div className="pb-4">
      <div className="flex items-baseline justify-between px-6 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400">
            jamspots
          </p>
          <h1 className="mt-0.5 text-xl font-bold leading-none tracking-tight text-white">
            New jam
          </h1>
        </div>
        <span className="text-[11px] font-medium tabular-nums text-amber-100/40">
          Step {activeIndex < 0 ? 1 : activeIndex + 1} of {sections.length}
        </span>
      </div>

      {/* horizontal chip nav */}
      <div
        className="
          flex gap-2 overflow-x-auto px-6 pb-1
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        {sections.map(({ id, label, Icon }) => {
          const isActive = currentSection === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                // call the current section save function
                goToSection(id);
                childSaveOnUnmount.current?.(); // then switch section
              }}
              className={`
                flex shrink-0 items-center gap-2 rounded-full border py-2 pl-2 pr-4
                text-[13px] font-medium tracking-tight whitespace-nowrap
                transition-colors duration-200 active:scale-[0.98] cursor-pointer
                ${
                  isActive
                    ? 'border-amber-400/45 bg-amber-400/15 text-white'
                    : 'border-amber-100/10 bg-amber-100/[0.04] text-amber-100/45'
                }
              `}
            >
              <span
                className={`
                  flex h-6 w-6 items-center justify-center rounded-full
                  ${isActive ? 'bg-amber-400/25' : 'bg-amber-100/[0.07]'}
                `}
              >
                <Icon
                  width={14}
                  height={14}
                  fill={isActive ? '#fbbf24' : '#a8a29e'}
                />
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
