import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';

export default function Help() {
  const faqs = [
    {
      q: '¿Qué es una Jam Session?',
      a: 'Es un encuentro musical donde músicos tocan juntos. A veces es totalmente libre, otras se toca una canción conocida previamente, y otras es un mix de ambos estilos.',
    },
    {
      q: '¿Dónde se realizan estas sesiones?',
      a: 'Lo más común son bares, salas de conciertos o locales especializados en música, aunque también pueden hacerse en espacios abiertos o estudios.',
    },
    {
      q: '¿Qué debo llevar?',
      a: 'Tu instrumento, aunque a veces los locales dejan instrumentos disponibles en el lugar, y muchas ganas de tocar.',
    },
    {
      q: 'Normas básicas',
      a: 'Respeta los turnos, no interrumpas a otros músicos y respeta la decisión de quien lleva la jam, incluso aunque creas que se equivoca.',
    },
    {
      q: '¿Qué es un Open Mic?',
      a: 'Un Open Mic es un evento donde cualquier persona puede subir al escenario a tocar, cantar o recitar, normalmente sin necesidad de inscribirse previamente. Es ideal para probar canciones nuevas, presentarte ante público y conocer a otros músicos.',
    },
    {
      q: 'Consejos para participar en un Open Mic',
      a: 'Llega con antelación, prepara un par de canciones cortas, respeta los turnos y disfruta la experiencia. No importa tu nivel: la idea es compartir y aprender.',
    },
  ];

  return (
    <div className="w-[1300px] max-w-[90%] mx-auto py-6 px-2 lg:p-6 ">
      <div className="inline-block">
        <Link href="/">
          <div className="ml-3 flex gap-2 items-end">
            <BrandLogo className="max-h-16 max-w-75 w-auto h-auto object-contain" />
            <p className="text-xs py-3 text-gray-600 font-semibold">
              {BRAND.tagline}
            </p>
          </div>
        </Link>
      </div>
      <div className="px-4 py-12 lg:p-12 lg:max-w-3xl mx-auto text-tone-0">
        <h1 className="text-2xl font-semibold mb-12 text-center">Help / FAQ</h1>
        <div className="flex flex-col gap-4">
          {faqs.map((item, i) => (
            <div key={i} className="border rounded-xl p-4 bg-tone-0/90">
              <p className="font-semibold text-tone-6">{item.q}</p>
              <p className="mt-1 text-tone-6/80">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
