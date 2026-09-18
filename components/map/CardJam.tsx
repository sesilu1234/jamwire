import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import Image from 'next/image';

type JamCardProps = {
  jamName: string;
  spotName: string;
  address: string;
  display_date: string;
  tags?: string[];
  src?: string;
  slug?: string;
  classname?: string;
};

export default function JamCard({
  jamName,
  spotName,
  address,
  display_date,
  tags,
  src,
  slug,
  classname,
}: JamCardProps) {
  return (
    <Card
      className={`flex flex-col p-4    w-64  shadow-md  bg-card-jams/85
 ${classname}`}
    >
      <Link href={`/jam/${slug}`} prefetch={false}>
        {/* Image left (desktop) / top (mobile) */}
        <div className="relative   h-48">
          {src && (
            <Image
              src={src}
              alt={`${jamName} at ${spotName}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px" // Add this line
              className="object-cover object-top"
            />
          )}
        </div>

        {/* Right panel */}
        <CardContent className="flex flex-col gap-1 justify-between text-xs pt-3 pb-2 ">
          <div
            className="font-medium text-lg text-tone-0 mb-2 line-clamp-2 overflow-hidden text-ellipsis"
            title={`${jamName} at ${spotName}`}
          >
            {jamName} at {spotName}
          </div>

          <div className="text-xs text-tone-0/70 truncate">{address}</div>

          <div className="text-sm text-tone-0/90">{display_date}</div>
          {tags && (
            <div className="flex flex-wrap gap-1 mt-3 text-font-6">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className=" border-1 border-tone-0 text-tone-0/95 rounded px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
