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

export default function EditSections_desktop({
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

  return (
    <nav className="flex flex-col gap-1 px-4">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100/25">
        Sections
      </p>

      {sections.map(({ id, label, Icon }, index) => {
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
              group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5
              text-left transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'bg-amber-400/[0.12] text-white'
                  : 'text-amber-100/45 hover:bg-amber-100/[0.05] hover:text-amber-50'
              }
            `}
          >
            {/* active indicator */}
            <span
              aria-hidden
              className={`
                absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full
                bg-amber-400 transition-all duration-200
                ${isActive ? 'opacity-100' : 'opacity-0'}
              `}
            />

            <span
              className={`
                flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-amber-400/20'
                    : 'bg-amber-100/[0.05] group-hover:bg-amber-100/[0.09]'
                }
              `}
            >
              <Icon
                width={20}
                height={20}
                fill={isActive ? '#fbbf24' : '#a8a29e'}
              />
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  isActive ? 'text-amber-400/70' : 'text-amber-100/25'
                }`}
              >
                Step {index + 1}
              </span>
              <span className="block truncate text-[14px] font-medium tracking-tight">
                {label}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
