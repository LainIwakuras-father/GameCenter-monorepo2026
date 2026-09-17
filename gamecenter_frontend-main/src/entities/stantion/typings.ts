export interface Stantion {
  id: number;
  time: number;
  points: number;
  name: string;
  description: string | null;

  /** url в сервер со статикой */
  image: string | null;

  /** основное задание */
  assignment: string | null;
}

export interface StantionsOrder {
  id: number;
  /** A route can contain empty slots until the organizer finishes setup. */
  order: Array<Stantion["id"] | null>;
}

export interface RawStantionsOrder {
  id: number;
  first: Stantion["id"] | null;
  second: Stantion["id"] | null;
  third: Stantion["id"] | null;
  fourth: Stantion["id"] | null;
  fifth: Stantion["id"] | null;
  sixth: Stantion["id"] | null;
  seventh: Stantion["id"] | null;
  eighth: Stantion["id"] | null;
  ninth: Stantion["id"] | null;
  tenth: Stantion["id"] | null;
}
