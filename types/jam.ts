export type Jam = {
  id: string;
  jam_title: string;
  location_title: string;
  location_address: string;
  periodicity: string;
  dayOfWeek: string | null;
  dates: string[];
  images: string[];
  modality: string;
  styles: string[];
  lista_canciones: boolean;
  instruments_lend: boolean;
  drums: boolean;
  description: {
    blocks: {
      key: string;
      data: Record<string, any>;
      text: string;
      type: string;
      depth: number;
      entityRanges: any[];
      inlineStyleRanges: any[];
    }[];
    entityMap: Record<string, any>;
  };
  social_links: {
    siteWeb: string;
    facebook: string;
    instagram: string;
  };
  location_coords: string;
  host_id: string;
  created_at: string;
  time_start: string;
  f_next_date: string;
  slug: string;
  lng: number;
  lat: number;
  display_date: string;
};

export interface JamCard {
  id: string;
  jam_title: string;
  location_title: string;
  styles: string[];
  location_address: string;
  next_date: string; // ISO String from Postgres
  jam_timezone: string;
  time_start: string;
  images: string[];
  slug: string;
  lat: number;
  lng: number;
  priority_score: number;
  distance_meters: number;
  display_date: string;
  image: string;
  /** 'jam' | 'open_mic'. Optional: older rows and some queries omit it. */
  modality?: string;
}

export interface UserLocation {
  city: string;
  latitude: number;
  longitude: number;
}
