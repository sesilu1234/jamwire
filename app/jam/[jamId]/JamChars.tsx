import React from 'react';

type JamDetailsProps = {
  jamDetails: {
    styles: string[];
    drums: boolean;
    lista_canciones: boolean;
    instruments_lend: boolean;
  };
  /** The modality colour from the page, used to mark what a jam *has*. */
  accent?: string;
};

/* The icons were written inline in the markup, which made the layout
   impossible to read. Same paths, just named. */

function DrumsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 27" fill="none" aria-hidden {...props}>
      <path
        d="M16.5446 7.40721C16.2562 7.28105 15.9498 7.17292 15.6254 7.06479L19.0677 1.11739L17.1213 0L13.3366 6.52411C12.2045 6.34031 11.0592 6.24989 9.91233 6.25378C8.81411 6.25363 7.71752 6.33799 6.63225 6.50609L2.88359 0L0.901121 1.11739L4.3434 7.02874C3.98065 7.13022 3.62536 7.25668 3.28008 7.40721C0.432538 8.56065 0 10.1466 0 11.0117V21.6449C0 22.4739 0.432538 24.0599 3.28008 25.2494C5.40164 26.0311 7.65201 26.4041 9.91233 26.3488C12.1749 26.3926 14.4254 26.0073 16.5446 25.2134C19.3921 24.0419 19.8247 22.4559 19.8247 21.6089V10.9937C19.8247 10.1466 19.3921 8.56065 16.5446 7.40721ZM4.12713 9.5699C4.57442 9.39284 5.03179 9.24239 5.49684 9.11934L6.92061 11.5884L8.86703 10.453L7.85777 8.65076C8.53953 8.56579 9.22538 8.51766 9.91233 8.50658C10.653 8.50957 11.3929 8.55168 12.1291 8.63274L11.1198 10.435L13.0662 11.5704L14.472 9.15539C16.4545 9.69606 17.5719 10.5251 17.5719 11.0658C17.5719 11.6064 16.9951 12.039 15.7696 12.5616C13.892 13.2307 11.9042 13.5365 9.91233 13.4627C5.15441 13.4627 2.2528 11.8587 2.2528 10.9937C2.2528 10.6152 2.82952 10.0205 4.12713 9.5699ZM15.6975 23.2129C13.8414 23.8669 11.879 24.1664 9.91233 24.096C5.15441 24.096 2.2528 22.492 2.2528 21.6269V19.4101C2.58672 19.5897 2.92959 19.7521 3.28008 19.8967C5.39927 20.6907 7.64971 21.076 9.91233 21.0322C12.1749 21.076 14.4254 20.6907 16.5446 19.8967C16.8951 19.7521 17.2379 19.5897 17.5719 19.4101V21.6269C17.5719 21.9873 16.9951 22.6001 15.6975 23.1228V23.2129ZM15.6975 17.8963C13.8414 18.5502 11.879 18.8498 9.91233 18.7794C5.15441 18.7794 2.2528 17.1754 2.2528 16.3103V14.0935C2.58672 14.2731 2.92959 14.4355 3.28008 14.5801C5.39927 15.3741 7.64971 15.7594 9.91233 15.7155C12.1749 15.7594 14.4254 15.3741 16.5446 14.5801C16.8951 14.4355 17.2379 14.2731 17.5719 14.0935V16.3103C17.5719 16.6707 16.9951 17.2835 15.6975 17.8061V17.8963Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SetlistIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 31 31" aria-hidden {...props}>
      <path
        d="M10.3637 22.756C10.6863 22.756 10.9565 22.6468 11.1743 22.4286C11.3918 22.2104 11.5006 21.94 11.5006 21.6174C11.5006 21.2948 11.3915 21.0246 11.1733 20.8068C10.9551 20.5892 10.6847 20.4804 10.3621 20.4804C10.0394 20.4804 9.76934 20.5895 9.55176 20.8077C9.33397 21.026 9.22508 21.2964 9.22508 21.619C9.22508 21.9416 9.33419 22.2117 9.55241 22.4293C9.77084 22.6471 10.0413 22.756 10.3637 22.756ZM10.3637 17.7595C10.6863 17.7595 10.9565 17.6504 11.1743 17.4322C11.3918 17.214 11.5006 16.9435 11.5006 16.6209C11.5006 16.2983 11.3915 16.0282 11.1733 15.8106C10.9551 15.5931 10.6847 15.4843 10.3621 15.4843C10.0394 15.4843 9.76934 15.5934 9.55176 15.8116C9.33397 16.0298 9.22508 16.3002 9.22508 16.6229C9.22508 16.9455 9.33419 17.2156 9.55241 17.4331C9.77084 17.6507 10.0413 17.7595 10.3637 17.7595ZM10.3637 12.7634C10.6863 12.7634 10.9565 12.6543 11.1743 12.4361C11.3918 12.2178 11.5006 11.9474 11.5006 11.6248C11.5006 11.3022 11.3915 11.0321 11.1733 10.8145C10.9551 10.5967 10.6847 10.4878 10.3621 10.4878C10.0394 10.4878 9.76934 10.5969 9.55176 10.8152C9.33397 11.0334 9.22508 11.3038 9.22508 11.6264C9.22508 11.949 9.33419 12.2192 9.55241 12.437C9.77084 12.6546 10.0413 12.7634 10.3637 12.7634ZM14.271 22.5826H21.5922V20.6537H14.271V22.5826ZM14.271 17.5865H21.5922V15.6573H14.271V17.5865ZM14.271 12.5901H21.5922V10.6611H14.271V12.5901ZM6.82605 27.5543C6.17632 27.5543 5.62637 27.3293 5.17622 26.8791C4.72606 26.4289 4.50098 25.879 4.50098 25.2293V8.01453C4.50098 7.3648 4.72606 6.81485 5.17622 6.36469C5.62637 5.91453 6.17632 5.68945 6.82605 5.68945H24.0408C24.6905 5.68945 25.2405 5.91453 25.6906 6.36469C26.1408 6.81485 26.3659 7.3648 26.3659 8.01453V25.2293C26.3659 25.879 26.1408 26.4289 25.6906 26.8791C25.2405 27.3293 24.6905 27.5543 24.0408 27.5543H6.82605ZM6.82605 25.6251H24.0408C24.1398 25.6251 24.2305 25.5838 24.3128 25.5013C24.3953 25.419 24.4366 25.3283 24.4366 25.2293V8.01453C24.4366 7.91549 24.3953 7.82482 24.3128 7.7425C24.2305 7.65997 24.1398 7.61871 24.0408 7.61871H6.82605C6.72701 7.61871 6.63634 7.65997 6.55402 7.7425C6.4715 7.82482 6.43023 7.91549 6.43023 8.01453V25.2293C6.43023 25.3283 6.4715 25.419 6.55402 25.5013C6.63634 25.5838 6.72701 25.6251 6.82605 25.6251Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstrumentsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden {...props}>
      <path
        d="M6.47043 24.9923C5.85458 24.9923 5.33332 24.779 4.90663 24.3523C4.47994 23.9256 4.2666 23.4043 4.2666 22.7885V6.47141C4.2666 5.85556 4.47994 5.33429 4.90663 4.90761C5.33332 4.48092 5.85458 4.26758 6.47043 4.26758H22.7875C23.4033 4.26758 23.9246 4.48092 24.3513 4.90761C24.778 5.33429 24.9913 5.85556 24.9913 6.47141V22.7885C24.9913 23.4043 24.778 23.9256 24.3513 24.3523C23.9246 24.779 23.4033 24.9923 22.7875 24.9923H6.47043ZM6.47043 23.1636H10.3036V17.4903H9.90494C9.5829 17.4903 9.3149 17.3832 9.10095 17.169C8.88679 16.9549 8.77971 16.6868 8.77971 16.3647V6.09623H6.47043C6.36092 6.09623 6.27101 6.13138 6.20071 6.20168C6.1304 6.27198 6.09525 6.36189 6.09525 6.47141V22.7885C6.09525 22.898 6.1304 22.9879 6.20071 23.0582C6.27101 23.1285 6.36092 23.1636 6.47043 23.1636ZM18.9543 23.1636H22.7875C22.897 23.1636 22.9869 23.1285 23.0572 23.0582C23.1275 22.9879 23.1627 22.898 23.1627 22.7885V6.47141C23.1627 6.36189 23.1275 6.27198 23.0572 6.20168C22.9869 6.13138 22.897 6.09623 22.7875 6.09623H20.4782V16.3647C20.4782 16.6868 20.3711 16.9549 20.157 17.169C19.943 17.3832 19.675 17.4903 19.353 17.4903H18.9543V23.1636ZM11.7571 23.1636H17.5009V17.4903H17.1022C16.7804 17.4903 16.5124 17.3832 16.2982 17.169C16.0841 16.9549 15.977 16.6868 15.977 16.3647V6.09623H13.2809V16.3647C13.2809 16.6868 13.1739 16.9549 12.9597 17.169C12.7456 17.3832 12.4776 17.4903 12.1557 17.4903H11.7571V23.1636Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StylesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M10 21C8.9 21 7.95833 20.6083 7.175 19.825C6.39167 19.0417 6 18.1 6 17C6 15.9 6.39167 14.9583 7.175 14.175C7.95833 13.3917 8.9 13 10 13C10.3833 13 10.7375 13.0458 11.0625 13.1375C11.3875 13.2292 11.7 13.3667 12 13.55V3H18V7H14V17C14 18.1 13.6083 19.0417 12.825 19.825C12.0417 20.6083 11.1 21 10 21Z"
      />
    </svg>
  );
}

/** Small uppercase caption, matching the section labels on the page. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.6875rem] font-bold tracking-[0.16em] text-tone-0/40 uppercase">
      {children}
    </span>
  );
}

export default function JamDetails({ jamDetails, accent }: JamDetailsProps) {
  const styles = jamDetails.styles ?? [];

  /* Three facts, each with an on and an off reading. They used to be three
     bare sentences in a column, where "No setlist" looked exactly as
     important as "Has setlist". As a row of tiles the answer is the thing you
     read, and a feature the jam lacks stays visibly quieter. */
  const facts = [
    {
      key: 'drums',
      Icon: DrumsIcon,
      caption: 'Drums',
      on: jamDetails.drums,
      value: jamDetails.drums ? 'Kit on site' : 'Acoustic, no kit',
    },
    {
      key: 'setlist',
      Icon: SetlistIcon,
      caption: 'Setlist',
      on: jamDetails.lista_canciones,
      value: jamDetails.lista_canciones ? 'Songs listed' : 'No setlist',
    },
    {
      key: 'instruments',
      Icon: InstrumentsIcon,
      caption: 'Instruments',
      on: jamDetails.instruments_lend,
      value: jamDetails.instruments_lend ? 'Some to borrow' : 'Bring your own',
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <h2 className="text-xs font-bold tracking-[0.18em] text-tone-0/40 uppercase">
          What it&apos;s like
        </h2>
        <span
          aria-hidden
          className="h-px flex-1 bg-linear-to-r from-tone-0/15 to-transparent"
        />
      </div>

      {styles.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <StylesIcon className="size-4 shrink-0 text-tone-0/35" />
            <Caption>Styles played</Caption>
          </div>
          <div className="flex flex-wrap gap-2">
            {styles.map((style, i) => (
              <span
                key={i}
                className="rounded-full border border-tone-0/12 bg-tone-0/6 px-3.5 py-1.5 text-sm font-medium text-tone-0/85"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {facts.map(({ key, Icon, caption, on, value }) => (
          <div
            key={key}
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              on ? 'border-tone-0/12 bg-tone-0/5' : 'border-tone-0/8'
            }`}
          >
            <Icon
              className={`mt-0.5 size-5 shrink-0 ${on ? '' : 'text-tone-0/25'}`}
              style={on && accent ? { color: accent } : undefined}
            />
            <div className="flex min-w-0 flex-col gap-1">
              <Caption>{caption}</Caption>
              <span
                className={`text-sm font-medium ${
                  on ? 'text-tone-0/90' : 'text-tone-0/45'
                }`}
              >
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
