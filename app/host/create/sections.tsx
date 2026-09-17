'use client';

import { useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { formAtom } from './store/jotai';

import GeneralInfo from './edit_areas/GeneralInfo';
import UploadPhotos from './edit_areas/UploadPhotos';
import PlaceChars from './edit_areas/PlaceChars';
import Social from './edit_areas/Social';
import PlaceDescription from './edit_areas/PlaceDescription';
import { useMemo } from 'react';

import { useFormStore } from './store/formStore'; // path a tu store

type EditAreaProps = {
  childSaveOnUnmount: React.RefObject<() => void>;
};

export default function Sections({ childSaveOnUnmount }: EditAreaProps) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section') || 'informaciongeneral';

  const currentSection = useMemo(() => sectionParam, [sectionParam]);

  const form = useFormStore((state) => state.form);

  return (
    <div
      key={currentSection}
      className="animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      {currentSection === 'informaciongeneral' && (
        <GeneralInfo
          data={form.generalInfo}
          childSaveOnUnmount={childSaveOnUnmount}
        />
      )}
      {currentSection === 'fotos' && (
        <UploadPhotos
          data={form.photos}
          childSaveOnUnmount={childSaveOnUnmount}
        />
      )}
      {currentSection === 'caracteristicas' && (
        <PlaceChars
          data={form.features}
          childSaveOnUnmount={childSaveOnUnmount}
        />
      )}
      {currentSection === 'descripcion' && (
        <PlaceDescription
          data={form.description}
          childSaveOnUnmount={childSaveOnUnmount}
        />
      )}
      {currentSection === 'redessociales' && (
        <Social data={form.social} childSaveOnUnmount={childSaveOnUnmount} />
      )}
    </div>
  );
}
