import { Instagram, Facebook, Globe, LucideIcon } from 'lucide-react';

type SocialLinksProps = {
  socialLinks: {
    siteWeb?: string;
    facebook?: string;
    instagram?: string;
  };
};

interface SocialConfig {
  url?: string;
  icon: LucideIcon;
  label: string;
}

export default function SocialLinks({ socialLinks }: SocialLinksProps) {
  const { instagram, facebook, siteWeb } = socialLinks || {};

  if (!instagram && !facebook && !siteWeb) return null;

  const configs: SocialConfig[] = [
    { url: instagram, icon: Instagram, label: 'Instagram' },
    { url: facebook, icon: Facebook, label: 'Facebook' },
    { url: siteWeb, icon: Globe, label: 'Website' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full max-w-md text-tone-0">
      {configs.map(({ url, icon: Icon, label }) => {
        if (!url) return null;

        const href = url.startsWith('http') ? url : `https://${url}`;

        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-tone-0/5  border border-tone-0/10 p-4 rounded-xl transition-all duration-200 hover:bg-tone-0/10 hover:border-tone-0/20 active:scale-[0.98]"
          >
            {/* shrink-0 prevents the icon from squishing */}
            <Icon className="w-5 h-5  group-hover:text-tone-0 shrink-0" />

            {/* min-w-0 lets this flex child shrink below its content width;
                without it a long URL pushes the row past the viewport. */}
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-medium text-tone-0/40 uppercase tracking-wider">
                {label}
              </span>
              <span className="block truncate text-sm font-medium group-hover:underline decoration-tone-0/30 underline-offset-4">
                {url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
